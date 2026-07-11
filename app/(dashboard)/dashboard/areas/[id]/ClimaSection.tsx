"use client";

import { useEffect, useState } from "react";
import {
  Thermometer, Droplets, Wind, Sun, CloudRain,
  Cloud, CloudSun, CloudFog, CloudDrizzle, CloudSnow,
  Zap, Leaf, Sprout, RefreshCw, AlertCircle,
} from "lucide-react";
import {
  buscarClimaArea,
  descricaoTempo,
  categoriaUV,
  categoriaEvapotranspiracao,
  categoriaUmidadeSolo,
  diaSemana,
  type ClimaArea,
  type PrevisaoDiaria,
} from "@/lib/openmeteo";

// ─── Ícone do tempo ────────────────────────────────────────────────────────────
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-white/8 rounded-xl animate-pulse ${className}`} />;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-5 gap-4">
        <Skeleton className="md:col-span-3 h-44" />
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
      <Skeleton className="h-36" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

// ─── Card de destaque ─────────────────────────────────────────────────────────
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

// ─── Card do dia ──────────────────────────────────────────────────────────────
function ForecastCard({ dia, isHoje }: { dia: PrevisaoDiaria; isHoje: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-colors ${
      isHoje ? "bg-[#B2D5E5]/10 border-[#B2D5E5]/25" : "bg-white/3 border-white/6"
    }`}>
      <span className={`text-xs font-semibold uppercase ${isHoje ? "text-[#B2D5E5]" : "text-white/40"}`}>
        {isHoje ? "Hoje" : diaSemana(dia.data)}
      </span>
      <WeatherIcon code={dia.weatherCode} className="w-5 h-5 text-white/70" />
      <span className="text-sm font-bold text-white">{dia.tempMax}°</span>
      <span className="text-xs text-white/30">{dia.tempMin}°</span>
      {dia.probChuva > 0 && (
        <div className="flex items-center gap-0.5">
          <Droplets className="w-3 h-3 text-[#B2D5E5]/70" strokeWidth={2} />
          <span className="text-[10px] text-[#B2D5E5]/70">{dia.probChuva}%</span>
        </div>
      )}
    </div>
  );
}

// ─── Barra de progresso ───────────────────────────────────────────────────────
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

// ─── Clima renderizado ────────────────────────────────────────────────────────
function ClimaContent({ clima }: { clima: ClimaArea }) {
  const { atual, previsao7dias, solo } = clima;
  const hoje = previsao7dias[0];
  const evapo = categoriaEvapotranspiracao(hoje.evapotranspiracao);
  const uv = categoriaUV(hoje.uvMax);
  const umidadeSolo = categoriaUmidadeSolo(solo.umidadeSolo39);

  return (
    <div className="space-y-4">
      {/* Condições atuais + destaques */}
      <div className="grid md:grid-cols-5 gap-4">
        <div
          className="md:col-span-3 rounded-2xl border border-[#B2D5E5]/15 p-6"
          style={{ background: "linear-gradient(135deg, rgba(178,213,229,0.10) 0%, rgba(178,213,229,0.03) 100%)" }}
        >
          <div className="flex items-start justify-between mb-6">
            <WeatherIcon code={atual.weatherCode} className="w-16 h-16 text-[#B2D5E5]" />
            <div className="text-right">
              <p className="text-6xl font-black text-white leading-none">{atual.temperatura}°</p>
              <p className="text-sm text-white/40 mt-1">Sensação {atual.sensacaoTermica}°C</p>
            </div>
          </div>
          <p className="text-base font-semibold text-white mb-4">{descricaoTempo(atual.weatherCode)}</p>
          <div className="flex items-center gap-5 text-sm text-white/50">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-4 h-4" strokeWidth={1.5} />
              {atual.umidade}%
            </span>
            <span className="flex items-center gap-1.5">
              <Wind className="w-4 h-4" strokeWidth={1.5} />
              {atual.vento} km/h
            </span>
            {atual.precipitacao > 0 && (
              <span className="flex items-center gap-1.5">
                <CloudRain className="w-4 h-4" strokeWidth={1.5} />
                {atual.precipitacao} mm agora
              </span>
            )}
          </div>
        </div>

        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <HighlightCard
            icon={<Thermometer className="w-4 h-4" strokeWidth={1.5} />}
            label="Máx / Mín"
            value={`${hoje.tempMax}° / ${hoje.tempMin}°`}
          />
          <HighlightCard
            icon={<CloudRain className="w-4 h-4" strokeWidth={1.5} />}
            label="Chuva"
            value={`${hoje.probChuva}%`}
            sub={hoje.precipitacao > 0 ? `${hoje.precipitacao} mm` : "Sem precipitação"}
          />
          <HighlightCard
            icon={<Wind className="w-4 h-4" strokeWidth={1.5} />}
            label="Vento máx"
            value={`${hoje.ventoMax} km/h`}
          />
          <HighlightCard
            icon={<Sun className="w-4 h-4" strokeWidth={1.5} />}
            label="UV"
            value={`${hoje.uvMax}`}
            sub={uv.label}
          />
        </div>
      </div>

      {/* Previsão 7 dias */}
      <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-4">
          Próximos 7 dias
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {previsao7dias.map((dia, i) => (
            <ForecastCard key={dia.data} dia={dia} isHoje={i === 0} />
          ))}
        </div>
      </div>

      {/* Solo & Irrigação */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white/3 border border-white/6 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-4 h-4 text-white/40" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider">Balanço hídrico</h2>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-3xl font-black text-white">{hoje.evapotranspiracao}</span>
            <span className="text-sm text-white/40">mm/dia</span>
            <span className={`text-sm font-semibold ml-auto ${evapo.cor}`}>{evapo.label}</span>
          </div>
          <p className="text-xs text-white/30 mb-4">Evapotranspiração de referência (ET₀)</p>
          <div className="h-px bg-white/6 mb-4" />
          <p className="text-sm text-white/60">{evapo.descricao}</p>
        </div>

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
                  { label: "Superfície (0 cm)", val: solo.tempSolo0cm },
                  { label: "6 cm", val: solo.tempSolo6cm },
                  { label: "18 cm", val: solo.tempSolo18cm },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-white/30">{s.label}</span>
                    <span className="text-sm font-semibold text-white">{s.val}°C</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-px bg-white/6" />
            <div>
              <p className="text-xs text-white/30 mb-2 uppercase tracking-wider">Umidade volumétrica</p>
              <div className="space-y-2">
                {[
                  { label: "0–1 cm", val: solo.umidadeSolo01 },
                  { label: "1–3 cm", val: solo.umidadeSolo13 },
                  { label: "3–9 cm", val: solo.umidadeSolo39 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/30">{s.label}</span>
                      <span className="text-xs font-semibold text-white">{s.val}%</span>
                    </div>
                    <ProgressBar value={s.val} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-white/15 text-center pb-4">
        Dados: Open-Meteo · Atualizado a cada hora · Modelo ERA5 + ICON
      </p>
    </div>
  );
}

// ─── Componente principal exportado ──────────────────────────────────────────
export function ClimaSection({ lat, lng }: { lat: number; lng: number }) {
  const [clima, setClima] = useState<ClimaArea | null>(null);
  const [erro, setErro] = useState(false);

  async function carregar() {
    setErro(false);
    setClima(null);
    try {
      const dados = await buscarClimaArea(lat, lng);
      setClima(dados);
    } catch {
      setErro(true);
    }
  }

  useEffect(() => { carregar(); }, [lat, lng]);

  if (erro) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/3 p-10 text-center">
        <AlertCircle className="w-8 h-8 text-white/20 mx-auto mb-3" strokeWidth={1.5} />
        <p className="text-white/40 text-sm mb-4">Não foi possível carregar os dados climáticos.</p>
        <button
          onClick={carregar}
          className="inline-flex items-center gap-2 text-sm text-[#B2D5E5] hover:text-[#B2D5E5]/70 transition-colors"
        >
          <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!clima) return <LoadingSkeleton />;

  return <ClimaContent clima={clima} />;
}
