"use client";

import { useTransition } from "react";
import { marcarComoLido, marcarTodosLidos } from "@/app/actions/alertas";
import { CheckCheck, Check } from "lucide-react";

export function BotaoMarcarLido({ alertaId }: { alertaId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(async () => { await marcarComoLido(alertaId); })}
      disabled={pending}
      className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors disabled:opacity-50 px-2 py-1 rounded-lg hover:bg-white/5"
    >
      <Check className="w-3.5 h-3.5" strokeWidth={2} />
      {pending ? "..." : "Marcar como lido"}
    </button>
  );
}

export function BotaoMarcarTodosLidos({ count }: { count: number }) {
  const [pending, startTransition] = useTransition();

  if (count === 0) return null;

  return (
    <button
      onClick={() => startTransition(async () => { await marcarTodosLidos(); })}
      disabled={pending}
      className="flex items-center gap-1.5 text-xs font-medium text-[#B2D5E5]/70 hover:text-[#B2D5E5] transition-colors disabled:opacity-50"
    >
      <CheckCheck className="w-4 h-4" strokeWidth={2} />
      {pending ? "Marcando..." : `Marcar todos como lidos (${count})`}
    </button>
  );
}
