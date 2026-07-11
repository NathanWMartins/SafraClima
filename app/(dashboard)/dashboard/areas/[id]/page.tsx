import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Sprout, Thermometer, Droplets,
  Wind, Sun, CloudRain, Cloud, CloudSun, CloudFog,
  CloudDrizzle, CloudSnow, Zap, Leaf, Clock,
} from "lucide-react";
import {
  descricaoTempo,
  categoriaUV,
  categoriaEvapotranspiracao,
  categoriaUmidadeSolo,
  diaSemana,
} from "@/lib/openmeteo";
import type { DadoClimaticoDiario } from "@prisma/client";

const culturaLabel: Record<string, string> = {
  SOJA: "Soja", MILHO: "Milho", CAFE: "Café", ALGODAO: "Algodão",
  CANA: "Cana-de-açúcar", ARROZ: "Arroz", FEIJAO: "Feijão",
  TRIGO: "Trigo", OUTROS: "Outros",
};

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const cls = className ?? "w-6 h-6";
  const sw = 1.5;
  if (code === 0) return <Sun className={cls} strokeWidth={sw} />;
  if (code <= 2) return <CloudSun className={cls} strokeWidth={sw} />;
  if (code === 3) return <Cloud className={cls} strokeWidth={sw} />;
  if (code <= 48) return <CloudFog className={cls} strokeWidth={sw} />;
  if (code <= 55) return <CloudDrizzle className={cls} strokeWidth={sw} />;
  if (code <= 82) return <CloudRain className={cls} strokeWidth={sw} />;
  if (code <= 86) return <CloudSnow className={cls} strokeWidth={sw} />;
  return <Zap className={cls} strokeWidth={sw} />;
}

function HighlightCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
}) {
  return (
    <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
      <div className="flex items-center gap-2 text-white/40 mb-2">
        {icon}
        <span className="text-xs uppercase tracking-wider font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-0.5">{sub}</p>}
    </div>
  );
}

function ForecastCard({ dia, isHoje }: { dia: DadoClimaticoDiario; isHoje: boolean }) {
  const dateStr = dia.data.toISOString().slice(0, 10);
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border ${
      isHoje ? "bg-[#B2D5E5]/10 border-[#B2D5E5]/25" : "bg-white/3 border-white/6"
    }`}>
      <span className={`text-xs font-semibold uppercase ${isHoje ? "text-[#B2D5E5]" : "text-white/40"}`}>
        {isHoje ? "Hoje" : diaSemana(dateStr)}
      </span>
      <WeatherIcon code={dia.weatherCode ?? 0} className="w-5 h-5 text-white/70" />
      <span className="text-sm font-bold text-white">{Math.round(dia.tempMax ?? 0)}°</span>
      <span className="text-xs text-white/30">{Math.round(dia.tempMin ?? 0)}°</span>
      {(dia.probPrecipitacao ?? 0) > 0 && (
        <div className="flex items-center gap-0.5">
          <Droplets className="w-3 h-3 text-[#B2D5E5]/70" strokeWidth={2} />
          <span className="text-[10px] text-[#B2D5E5]/70">{dia.probPrecipitacao}%</span>
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value, max = 60 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const cor =
    pct < 25 ? "bg-red-400" :
    pct < 55 ? "bg-emerald-400" :
    pct < 75 ? "bg-blue-400" : "bg-purple-400";
  return (
    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default async function AreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const area = await prisma.area.findUnique({ where: { id } });
  if (!area || area.userId !== session!.user!.id!) notFound();

  // Busca os próximos 7 dias a partir de hoje
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dados = await prisma.dadoClimaticoDiario.findMany({
    where: {
      areaId: area.id,
      data: { gte: hoje },
    },
    orderBy: { data: "asc" },
    take: 7,
  });

  const semDados = dados.length === 0;
  const diaAtual = dados[0];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/areas"
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          Minhas Áreas
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{area.nome}</h1>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="w-3.5 h-3.5 text-white/25" strokeWidth={1.5} />
              <span className="text-xs text-white/25 font-mono">
                {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
              </span>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs bg-[#B2D5E5]/10 text-[#B2D5E5] px-3 py-1.5 rounded-full font-medium">
            <Sprout className="w-3.5 h-3.5" strokeWidth={2} />
            {culturaLabel[area.cultura] ?? area.cultura}
          </span>
        </div>
      </div>

      {/* Estado: aguardando primeira coleta */}
      {semDados && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
          <Clock className="w-10 h-10 text-white/15 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-white font-semibold mb-2">Coletando dados climáticos</h2>
          <p className="text-sm text-white/35 max-w-sm mx-auto">
            Os dados desta área serão carregados na próxima coleta automática, que ocorre a cada hora.
            Volte em breve.
          </p>
        </div>
      )}

      {/* Dados disponíveis */}
      {!semDados && diaAtual && (
        <>
          {/* Condições do dia + destaques */}
          <div className="grid md:grid-cols-5 gap-4">
            <div
              className="md:col-span-3 rounded-2xl border border-[#B2D5E5]/15 p-6"
              style={{ background: "linear-gradient(135deg, rgba(178,213,229,0.10) 0%, rgba(178,213,229,0.03) 100%)" }}
            >
              <div className="flex items-start justify-between mb-6">
                <WeatherIcon code={diaAtual.weatherCode ?? 0} className="w-16 h-16 text-[#B2D5E5]" />
                <div className="text-right">
                  <p className="text-6xl font-black text-white leading-none">
                    {Math.round(diaAtual.tempMax ?? 0)}°
                  </p>
                  <p className="text-sm text-white/40 mt-1">
                    Mínima {Math.round(diaAtual.tempMin ?? 0)}°C
                  </p>
                </div>
              </div>
              <p className="text-base font-semibold text-white mb-4">
                {descricaoTempo(diaAtual.weatherCode ?? 0)}
              </p>
              <div className="flex items-center gap-5 text-sm text-white/50">
                {diaAtual.umidadeRelativa != null && (
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4" strokeWidth={1.5} />
                    {diaAtual.umidadeRelativa}%
                  </span>
                )}
                {diaAtual.ventoMax != null && (
                  <span className="flex items-center gap-1.5">
                    <Wind className="w-4 h-4" strokeWidth={1.5} />
                    {Math.round(diaAtual.ventoMax)} km/h
                  </span>
                )}
                {(diaAtual.precipitacao ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4" strokeWidth={1.5} />
                    {diaAtual.precipitacao} mm
                  </span>
                )}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-3">
              <HighlightCard
                icon={<Thermometer className="w-4 h-4" strokeWidth={1.5} />}
                label="Máx / Mín"
                value={`${Math.round(diaAtual.tempMax ?? 0)}° / ${Math.round(diaAtual.tempMin ?? 0)}°`}
              />
              <HighlightCard
                icon={<CloudRain className="w-4 h-4" strokeWidth={1.5} />}
                label="Chuva"
                value={`${diaAtual.probPrecipitacao ?? 0}%`}
                sub={(diaAtual.precipitacao ?? 0) > 0 ? `${diaAtual.precipitacao} mm` : "Sem precipitação"}
              />
              <HighlightCard
                icon={<Wind className="w-4 h-4" strokeWidth={1.5} />}
                label="Vento máx"
                value={`${Math.round(diaAtual.ventoMax ?? 0)} km/h`}
              />
              {diaAtual.uvMax != null && (() => {
                const uv = categoriaUV(diaAtual.uvMax);
                return (
                  <HighlightCard
                    icon={<Sun className="w-4 h-4" strokeWidth={1.5} />}
                    label="UV"
                    value={`${diaAtual.uvMax.toFixed(1)}`}
                    sub={uv.label}
                  />
                );
              })()}
            </div>
          </div>

          {/* Previsão 7 dias */}
          {dados.length > 1 && (
            <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
                Próximos {dados.length} dias
              </h2>
              <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${dados.length}, 1fr)` }}>
                {dados.map((dia, i) => (
                  <ForecastCard key={dia.id} dia={dia} isHoje={i === 0} />
                ))}
              </div>
            </div>
          )}

          {/* Solo & Irrigação */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Balanço hídrico */}
            {diaAtual.evapotranspiracao != null && (() => {
              const evapo = categoriaEvapotranspiracao(diaAtual.evapotranspiracao);
              return (
                <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Leaf className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Balanço hídrico</h2>
                  </div>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-black text-white">{diaAtual.evapotranspiracao.toFixed(1)}</span>
                    <span className="text-sm text-white/40">mm/dia</span>
                    <span className={`text-sm font-semibold ml-auto ${evapo.cor}`}>{evapo.label}</span>
                  </div>
                  <p className="text-xs text-white/30 mb-4">Evapotranspiração de referência (ET₀)</p>
                  <div className="h-px bg-white/6 mb-4" />
                  <p className="text-sm text-white/60">{evapo.descricao}</p>
                </div>
              );
            })()}

            {/* Solo */}
            {diaAtual.umidadeSolo39 != null && (() => {
              const umidadeSolo = categoriaUmidadeSolo(diaAtual.umidadeSolo39);
              return (
                <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sprout className="w-4 h-4 text-white/40" strokeWidth={1.5} />
                    <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Solo</h2>
                    <span className={`text-xs font-semibold ml-auto ${umidadeSolo.cor}`}>{umidadeSolo.label}</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Temperatura</p>
                      <div className="space-y-1.5">
                        {[
                          { label: "Superfície (0 cm)", val: diaAtual.tempSolo0cm },
                          { label: "6 cm", val: diaAtual.tempSolo6cm },
                          { label: "18 cm", val: diaAtual.tempSolo18cm },
                        ].map((s) => s.val != null && (
                          <div key={s.label} className="flex items-center justify-between">
                            <span className="text-xs text-white/30">{s.label}</span>
                            <span className="text-sm font-semibold text-white">{s.val.toFixed(1)}°C</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="h-px bg-white/6" />
                    <div>
                      <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Umidade volumétrica</p>
                      <div className="space-y-2">
                        {[
                          { label: "0–1 cm", val: diaAtual.umidadeSolo01 },
                          { label: "1–3 cm", val: diaAtual.umidadeSolo13 },
                          { label: "3–9 cm", val: diaAtual.umidadeSolo39 },
                        ].map((s) => s.val != null && (
                          <div key={s.label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-white/30">{s.label}</span>
                              <span className="text-xs font-semibold text-white">{s.val.toFixed(1)}%</span>
                            </div>
                            <ProgressBar value={s.val} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <p className="text-xs text-white/15 text-center pb-4">
            Dados: Open-Meteo · Coleta automática a cada hora · Modelo ERA5 + ICON
          </p>
        </>
      )}
    </div>
  );
}
