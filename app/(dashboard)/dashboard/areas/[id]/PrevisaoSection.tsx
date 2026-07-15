"use client";

import { useState } from "react";
import {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle,
  CloudRain, CloudSnow, Zap, Droplets, ChevronDown,
} from "lucide-react";

export interface DiaData {
  id: string;
  data: string; // ISO date string
  tempMax: number | null;
  tempMin: number | null;
  probPrecipitacao: number | null;
  precipitacao: number | null;
  weatherCode: number | null;
  ventoMax: number | null;
  nascerSol: string | null;
  porSol: string | null;
  duracaoSol: number | null;
}

export interface HoraData {
  id: string;
  hora: string; // ISO datetime string
  temperatura: number | null;
  sensacaoTermica: number | null;
  umidade: number | null;
  probChuva: number | null;
  precipitacao: number | null;
  weatherCode: number | null;
  vento: number | null;
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  const cls = className ?? "w-5 h-5";
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

function formatHora(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function diaSemana(iso: string, curto = true): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { weekday: curto ? "short" : "long" }).replace(".", "");
}

// ─── Scroll de horas ──────────────────────────────────────────────────────────
function HorarioScroll({ horas, horaAtual }: { horas: HoraData[]; horaAtual?: number }) {
  if (!horas.length) {
    return (
      <p className="text-xs text-white/20 py-4 text-center">
        Dados horários ainda não disponíveis.
      </p>
    );
  }

  return (
    <div style={{ overflowX: "auto", overflowY: "visible", paddingBottom: "8px" }}>
      <div className="flex gap-2" style={{ minWidth: "max-content", width: "max-content" }}>
        {horas.map((h) => {
          const hora = new Date(h.hora).getHours();
          const isAtual = hora === horaAtual;
          return (
            <div
              key={h.id}
              className={`flex flex-col items-center gap-1.5 px-3 py-3 rounded-2xl border flex-shrink-0 w-16 transition-colors ${
                isAtual
                  ? "bg-[#B2D5E5]/15 border-[#B2D5E5]/30"
                  : "bg-white/3 border-white/6"
              }`}
            >
              <span className={`text-[10px] font-semibold ${isAtual ? "text-[#B2D5E5]" : "text-white/35"}`}>
                {formatHora(h.hora)}
              </span>
              <WeatherIcon code={h.weatherCode ?? 0} className="w-4 h-4 text-white/60" />
              <span className="text-sm font-bold text-white">
                {h.temperatura != null ? `${Math.round(h.temperatura)}°` : "—"}
              </span>
              {(h.probChuva ?? 0) > 0 && (
                <div className="flex items-center gap-0.5">
                  <Droplets className="w-2.5 h-2.5 text-[#B2D5E5]/60" strokeWidth={2} />
                  <span className="text-[9px] text-[#B2D5E5]/60">{h.probChuva}%</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Card de dia (accordion) ──────────────────────────────────────────────────
function DiaCard({
  dia,
  horas,
  defaultOpen = false,
}: {
  dia: DiaData;
  horas: HoraData[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isHoje = defaultOpen;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-colors ${
      isHoje ? "border-[#B2D5E5]/20 bg-[#B2D5E5]/5" : "border-white/8 bg-white/3"
    }`}>
      {/* Header clicável */}
      <button
        onClick={() => !isHoje && setOpen((o) => !o)}
        className={`w-full flex items-center gap-3 px-4 py-3 text-left ${!isHoje ? "hover:bg-white/3 transition-colors" : ""}`}
      >
        {/* Dia */}
        <div className="w-12 flex-shrink-0">
          <p className={`text-xs font-bold uppercase ${isHoje ? "text-[#B2D5E5]" : "text-white/50"}`}>
            {isHoje ? "Hoje" : diaSemana(dia.data)}
          </p>
          {!isHoje && (
            <p className="text-[10px] text-white/20">
              {new Date(dia.data + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
            </p>
          )}
        </div>

        {/* Ícone */}
        <WeatherIcon code={dia.weatherCode ?? 0} className="w-5 h-5 text-white/60 flex-shrink-0" />

        {/* Temp */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-base font-bold text-white">{dia.tempMax != null ? `${Math.round(dia.tempMax)}°` : "—"}</span>
          <span className="text-sm text-white/30">{dia.tempMin != null ? `${Math.round(dia.tempMin)}°` : "—"}</span>
        </div>

        {/* Chuva */}
        {(dia.probPrecipitacao ?? 0) > 0 && (
          <div className="flex items-center gap-1 ml-1">
            <Droplets className="w-3.5 h-3.5 text-[#B2D5E5]/60" strokeWidth={2} />
            <span className="text-xs text-[#B2D5E5]/60">{dia.probPrecipitacao}%</span>
          </div>
        )}

        {/* Vento — só desktop */}
        {dia.ventoMax != null && (
          <span className="hidden md:block text-xs text-white/20 ml-2">
            💨 {Math.round(dia.ventoMax)} km/h
          </span>
        )}

        {/* Chevron */}
        {!isHoje && (
          <ChevronDown
            className={`w-4 h-4 text-white/20 ml-auto flex-shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            strokeWidth={2}
          />
        )}
      </button>

      {/* Horas expandidas */}
      {(isHoje || open) && (
        <div className="px-4 pb-4">
          <div className="border-t border-white/6 pt-3">
            <HorarioScroll horas={horas} horaAtual={isHoje ? new Date().getHours() : undefined} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export function PrevisaoSection({
  dias,
  horarios,
}: {
  dias: DiaData[];
  horarios: HoraData[];
}) {
  if (!dias.length) return null;

  // Agrupa horários por data (YYYY-MM-DD)
  const horasPorDia: Record<string, HoraData[]> = {};
  for (const h of horarios) {
    const dia = h.hora.slice(0, 10);
    if (!horasPorDia[dia]) horasPorDia[dia] = [];
    horasPorDia[dia].push(h);
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
        Previsão
      </h2>
      {dias.map((dia, i) => (
        <DiaCard
          key={dia.id}
          dia={dia}
          horas={horasPorDia[dia.data] ?? []}
          defaultOpen={i === 0}
        />
      ))}
    </div>
  );
}
