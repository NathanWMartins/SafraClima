"use client";

import { useState, useTransition } from "react";
import { TipoAlerta } from "@prisma/client";
import { atualizarPreferencia } from "@/app/actions/alertas";
import {
  LABEL_ALERTA,
  DESCRICAO_ALERTA,
  THRESHOLDS_PADRAO,
  UNIDADE_ALERTA,
  TIPO_ICONE,
} from "@/lib/alertas-defaults";
import { User, Bell } from "lucide-react";

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative inline-flex items-center rounded-full transition-colors flex-shrink-0 ${
        checked ? "bg-[#B2D5E5]" : "bg-white/15"
      }`}
      style={{ width: 44, height: 24 }}
    >
      <span
        className="absolute bg-white rounded-full shadow transition-transform"
        style={{
          width: 18,
          height: 18,
          left: 3,
          transform: checked ? "translateX(20px)" : "translateX(0px)",
        }}
      />
    </button>
  );
}

// ─── Tipos configuráveis ──────────────────────────────────────────────────────
type TipoAlertaConfig = Exclude<TipoAlerta, "ENCHENTE">;

const TIPOS_CONFIGURÁVEIS: TipoAlertaConfig[] = [
  "GEADA",
  "CHUVA_INTENSA",
  "VENTO_FORTE",
  "SECA",
  "UV_ALTO",
  "QUALIDADE_AR_RUIM",
];

// ─── Aba: Preferências de alertas ────────────────────────────────────────────
function AbaAlertas({
  preferencias,
}: {
  preferencias: Array<{ tipo: TipoAlerta; ativo: boolean; limiar: number | null }>;
}) {
  const prefMap = new Map(preferencias.map((p) => [p.tipo, p]));

  const initial: Record<string, { ativo: boolean; limiar: string }> = {};
  for (const tipo of TIPOS_CONFIGURÁVEIS) {
    const pref = prefMap.get(tipo);
    initial[tipo] = {
      ativo: pref ? pref.ativo : true,
      limiar: pref?.limiar != null ? String(pref.limiar) : String(THRESHOLDS_PADRAO[tipo]),
    };
  }

  const [state, setState] = useState(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function salvar(tipo: TipoAlertaConfig, ativo: boolean, limiarStr: string) {
    setSaving(tipo);
    const limiar = parseFloat(limiarStr);
    startTransition(async () => {
      await atualizarPreferencia(tipo, ativo, isNaN(limiar) ? null : limiar);
      setSaving(null);
      setSaved(tipo);
      setTimeout(() => setSaved(null), 2000);
    });
  }

  function toggleAtivo(tipo: TipoAlertaConfig) {
    const novoAtivo = !state[tipo].ativo;
    setState((s) => ({ ...s, [tipo]: { ...s[tipo], ativo: novoAtivo } }));
    salvar(tipo, novoAtivo, state[tipo].limiar);
  }

  return (
    <div>
      <p className="text-xs text-white/35 mb-5 leading-relaxed">
        Defina os limites que ativam cada tipo de alerta. Use o toggle para desativar alertas que não são relevantes para sua operação. As alterações são salvas automaticamente.
      </p>
      <div className="space-y-3">
        {TIPOS_CONFIGURÁVEIS.map((tipo) => {
          const s = state[tipo];
          const unidade = UNIDADE_ALERTA[tipo];
          const padrao = THRESHOLDS_PADRAO[tipo];
          const isSaving = saving === tipo;
          const isSaved = saved === tipo;

          return (
            <div
              key={tipo}
              className={`rounded-2xl border p-4 transition-opacity ${
                s.ativo ? "border-white/8 bg-white/3" : "border-white/5 bg-white/1 opacity-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 text-lg">
                  {TIPO_ICONE[tipo]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-white">{LABEL_ALERTA[tipo]}</p>
                    <Toggle checked={s.ativo} onChange={() => toggleAtivo(tipo)} />
                  </div>

                  <p className="text-xs text-white/35 mb-3">{DESCRICAO_ALERTA[tipo]}</p>

                  {s.ativo && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40 flex-shrink-0">Limite:</span>
                      <input
                        type="number"
                        value={s.limiar}
                        onChange={(e) =>
                          setState((prev) => ({
                            ...prev,
                            [tipo]: { ...prev[tipo], limiar: e.target.value },
                          }))
                        }
                        onBlur={() => salvar(tipo, s.ativo, s.limiar)}
                        className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-[#B2D5E5]/40 transition-colors"
                        step={tipo === "GEADA" || tipo === "UV_ALTO" ? "0.1" : "1"}
                        min={0}
                      />
                      {unidade && <span className="text-xs text-white/30">{unidade}</span>}
                      <span className="text-[10px] text-white/20 ml-1">
                        (padrão: {padrao}{unidade})
                      </span>
                      <span className="text-xs ml-auto flex-shrink-0">
                        {isSaving && <span className="text-white/30">Salvando…</span>}
                        {isSaved && <span className="text-green-400">✓</span>}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Componente principal com abas ────────────────────────────────────────────
type Tab = "conta" | "alertas";

interface ContaTabsProps {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    plano: "FREE" | "PRO";
    planoAtéEm: Date | null;
  };
  preferencias: Array<{ tipo: TipoAlerta; ativo: boolean; limiar: number | null }>;
}

const PLANO_LABEL = { FREE: "Gratuito", PRO: "Pro" } as const;
const PLANO_COR = {
  FREE: "bg-white/8 text-white/50",
  PRO: "bg-[#B2D5E5]/15 text-[#B2D5E5]",
} as const;

export function ContaTabs({ user, preferencias }: ContaTabsProps) {
  const [tab, setTab] = useState<Tab>("conta");

  const tabs: { id: Tab; label: string; Icon: typeof User }[] = [
    { id: "conta", label: "Minha conta", Icon: User },
    { id: "alertas", label: "Alertas", Icon: Bell },
  ];

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-6 border border-white/8">
        {tabs.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === id
                ? "bg-white/10 text-white"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={tab === id ? 2 : 1.5} />
            {label}
          </button>
        ))}
      </div>

      {/* Aba: conta */}
      {tab === "conta" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5 flex items-center gap-4">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name ?? ""}
                className="w-14 h-14 rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#B2D5E5]/10 border border-white/10 flex items-center justify-center">
                <User className="w-7 h-7 text-[#B2D5E5]/60" strokeWidth={1.5} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-base mb-0.5">
                {user.name ?? "Usuário"}
              </p>
              <p className="text-sm text-white/40">{user.email}</p>
            </div>
            <span className={`inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${PLANO_COR[user.plano]}`}>
              {PLANO_LABEL[user.plano]}
            </span>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">Plano atual</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">
                  {user.plano === "PRO" ? "SafraClima Pro" : "SafraClima Gratuito"}
                </p>
                <p className="text-xs text-white/35 mt-0.5">
                  {user.plano === "PRO"
                    ? user.planoAtéEm
                      ? `Válido até ${new Date(user.planoAtéEm).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}`
                      : "Plano ativo"
                    : "Limite de 1 área monitorada"}
                </p>
              </div>
              {user.plano === "FREE" && (
                <a
                  href="/#planos"
                  className="text-xs font-semibold text-[#B2D5E5] hover:text-[#B2D5E5]/80 transition-colors border border-[#B2D5E5]/30 px-3 py-1.5 rounded-xl"
                >
                  Fazer upgrade
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Aba: alertas */}
      {tab === "alertas" && <AbaAlertas preferencias={preferencias} />}
    </div>
  );
}
