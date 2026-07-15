import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Sprout, Thermometer, Droplets,
  Wind, Sun, CloudRain, Cloud, CloudSun, CloudFog,
  CloudDrizzle, CloudSnow, Zap, Leaf, Clock, Wind as WindIcon,
} from "lucide-react";
import {
  descricaoTempo, categoriaUV, categoriaEvapotranspiracao,
  categoriaUmidadeSolo, categoriaUmidadeSolo as catSolo,
} from "@/lib/openmeteo";
import type { DadoClimaticoDiario, QualidadeArDiario } from "@prisma/client";
import { PrevisaoSection } from "./PrevisaoSection";

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

function ProgressBar({ value, max = 60 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  const cor = pct < 25 ? "bg-red-400" : pct < 55 ? "bg-emerald-400" : pct < 75 ? "bg-blue-400" : "bg-purple-400";
  return (
    <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${cor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function categoriaAQI(aqi: number): { label: string; cor: string; bg: string } {
  if (aqi <= 50) return { label: "Bom", cor: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" };
  if (aqi <= 100) return { label: "Moderado", cor: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" };
  if (aqi <= 150) return { label: "Insalubre para sensíveis", cor: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" };
  if (aqi <= 200) return { label: "Insalubre", cor: "text-red-400", bg: "bg-red-400/10 border-red-400/20" };
  return { label: "Muito insalubre", cor: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20" };
}

export default async function AreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  const area = await prisma.area.findUnique({ where: { id } });
  if (!area || area.userId !== session!.user!.id!) notFound();

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [dados, horarios, qualidadeAr] = await Promise.all([
    // 7 dias de previsão diária
    prisma.dadoClimaticoDiario.findMany({
      where: { areaId: area.id, data: { gte: hoje } },
      orderBy: { data: "asc" },
      take: 7,
    }),
    // Dados hora a hora (próximas 168h)
    prisma.dadoClimaticoHorario.findMany({
      where: { areaId: area.id, hora: { gte: new Date() } },
      orderBy: { hora: "asc" },
    }),
    // Qualidade do ar de hoje
    prisma.qualidadeArDiario.findFirst({
      where: { areaId: area.id, data: { gte: hoje } },
      orderBy: { data: "asc" },
    }),
  ]);

  const semDados = dados.length === 0;
  const diaAtual = dados[0];

  // Serializa para passar ao Client Component
  const diasSerializados = dados.map((d) => ({
    id: d.id,
    data: d.data.toISOString().slice(0, 10),
    tempMax: d.tempMax,
    tempMin: d.tempMin,
    probPrecipitacao: d.probPrecipitacao,
    precipitacao: d.precipitacao,
    weatherCode: d.weatherCode,
    ventoMax: d.ventoMax,
    nascerSol: d.nascerSol,
    porSol: d.porSol,
    duracaoSol: d.duracaoSol,
  }));

  const horariosSerializados = horarios.map((h) => ({
    id: h.id,
    hora: h.hora.toISOString(),
    temperatura: h.temperatura,
    sensacaoTermica: h.sensacaoTermica,
    umidade: h.umidade,
    probChuva: h.probChuva,
    precipitacao: h.precipitacao,
    weatherCode: h.weatherCode,
    vento: h.vento,
  }));

  return (
    <div className="p-6 md:p-8 max-w-5xl space-y-6 overflow-x-hidden">

      {/* ── Header ── */}
      <div>
        <Link href="/dashboard/areas"
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition-colors mb-4">
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

      {/* ── Sem dados ── */}
      {semDados && (
        <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
          <Clock className="w-10 h-10 text-white/15 mx-auto mb-4" strokeWidth={1} />
          <h2 className="text-white font-semibold mb-2">Coletando dados climáticos</h2>
          <p className="text-sm text-white/35 max-w-sm mx-auto">
            Os dados serão carregados na próxima coleta automática, que ocorre a cada hora.
          </p>
        </div>
      )}

      {!semDados && diaAtual && (
        <>
          {/* ── Condições do dia + destaques ── */}
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-3 rounded-2xl border border-[#B2D5E5]/15 p-6"
              style={{ background: "linear-gradient(135deg, rgba(178,213,229,0.10) 0%, rgba(178,213,229,0.03) 100%)" }}>
              <div className="flex items-start justify-between mb-6">
                <WeatherIcon code={diaAtual.weatherCode ?? 0} className="w-16 h-16 text-[#B2D5E5]" />
                <div className="text-right">
                  <p className="text-6xl font-black text-white leading-none">{Math.round(diaAtual.tempMax ?? 0)}°</p>
                  <p className="text-sm text-white/40 mt-1">Mínima {Math.round(diaAtual.tempMin ?? 0)}°C</p>
                </div>
              </div>
              <p className="text-base font-semibold text-white mb-3">{descricaoTempo(diaAtual.weatherCode ?? 0)}</p>
              <div className="flex items-center gap-5 text-sm text-white/50 mb-3">
                {diaAtual.umidadeRelativa != null && (
                  <span className="flex items-center gap-1.5"><Droplets className="w-4 h-4" strokeWidth={1.5} />{diaAtual.umidadeRelativa}%</span>
                )}
                {diaAtual.ventoMax != null && (
                  <span className="flex items-center gap-1.5"><Wind className="w-4 h-4" strokeWidth={1.5} />{Math.round(diaAtual.ventoMax)} km/h</span>
                )}
                {(diaAtual.precipitacao ?? 0) > 0 && (
                  <span className="flex items-center gap-1.5"><CloudRain className="w-4 h-4" strokeWidth={1.5} />{diaAtual.precipitacao} mm</span>
                )}
              </div>
              {/* Nascer/pôr do sol */}
              {diaAtual.nascerSol && (
                <div className="flex items-center gap-4 text-xs text-white/25 border-t border-white/6 pt-3 mt-1">
                  <span>☀️ Nasce {diaAtual.nascerSol}</span>
                  <span>🌙 Põe {diaAtual.porSol}</span>
                  {diaAtual.duracaoSol && (
                    <span>{Math.floor(diaAtual.duracaoSol / 60)}h{diaAtual.duracaoSol % 60}min de sol</span>
                  )}
                </div>
              )}
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

          {/* ── Previsão expandível (hoje horária + próximos dias accordion) ── */}
          <PrevisaoSection dias={diasSerializados} horarios={horariosSerializados} />

          {/* ── Qualidade do ar ── */}
          {qualidadeAr && qualidadeAr.usAqi != null && (() => {
            const aqiCat = categoriaAQI(qualidadeAr.usAqi);
            return (
              <div className={`rounded-2xl border p-5 ${aqiCat.bg}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Qualidade do Ar</h2>
                  <span className={`text-sm font-bold ${aqiCat.cor}`}>{aqiCat.label}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "AQI (US)", value: qualidadeAr.usAqi?.toString() ?? "—" },
                    { label: "PM2.5", value: qualidadeAr.pm25 != null ? `${qualidadeAr.pm25} μg/m³` : "—" },
                    { label: "PM10", value: qualidadeAr.pm10 != null ? `${qualidadeAr.pm10} μg/m³` : "—" },
                    { label: "Poeira", value: qualidadeAr.dust != null ? `${qualidadeAr.dust} μg/m³` : "—" },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-white/30 mb-1">{item.label}</p>
                      <p className="text-base font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* ── Solo & Irrigação ── */}
          <div className="grid md:grid-cols-2 gap-4">
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
