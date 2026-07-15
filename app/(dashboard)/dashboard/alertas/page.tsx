import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SeveridadeAlerta, TipoAlerta } from "@prisma/client";
import {
  SEVERIDADE_LABEL,
  SEVERIDADE_COR,
  SEVERIDADE_ORDEM,
  LABEL_ALERTA,
  TIPO_ICONE,
} from "@/lib/alertas-defaults";
import { BotaoMarcarLido, BotaoMarcarTodosLidos } from "./AlertaActions";
import { Bell, BellOff } from "lucide-react";

function badgeSeveridade(sev: SeveridadeAlerta) {
  const cor = SEVERIDADE_COR[sev];
  const bg =
    sev === "CRITICA"
      ? "bg-red-500/15 text-red-400 border border-red-500/20"
      : sev === "ALTA"
      ? "bg-orange-500/15 text-orange-400 border border-orange-500/20"
      : sev === "MEDIA"
      ? "bg-yellow-500/15 text-yellow-400 border border-yellow-500/20"
      : "bg-white/8 text-white/40 border border-white/10";

  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${bg}`}>
      {SEVERIDADE_LABEL[sev]}
    </span>
  );
}

export default async function AlertasPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const alertas = await prisma.alerta.findMany({
    where: { userId },
    include: { area: { select: { nome: true } } },
    orderBy: [{ lido: "asc" }, { createdAt: "desc" }],
  });

  const naoLidos = alertas.filter((a) => !a.lido);
  const lidos = alertas.filter((a) => a.lido);

  // Agrupa não lidos por severidade
  const porSeveridade: Record<SeveridadeAlerta, typeof naoLidos> = {
    CRITICA: [],
    ALTA: [],
    MEDIA: [],
    BAIXA: [],
  };
  for (const a of naoLidos) {
    porSeveridade[a.severidade].push(a);
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Alertas</h1>
          <p className="text-white/40 mt-1 text-sm">
            {naoLidos.length === 0
              ? "Nenhum alerta ativo no momento."
              : `${naoLidos.length} alerta${naoLidos.length !== 1 ? "s" : ""} não lido${naoLidos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <BotaoMarcarTodosLidos count={naoLidos.length} />
      </div>

      {/* Empty state */}
      {alertas.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/5 p-12 text-center">
          <div className="w-16 h-16 bg-[#B2D5E5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-[#B2D5E5]/60" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Tudo tranquilo</h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            Nenhum alerta gerado ainda. Os alertas aparecem aqui quando a previsão climática ultrapassar os limites configurados.
          </p>
        </div>
      )}

      {/* Alertas não lidos agrupados por severidade */}
      {naoLidos.length > 0 && (
        <div className="space-y-6 mb-8">
          {SEVERIDADE_ORDEM.map((sev) => {
            const grupo = porSeveridade[sev];
            if (!grupo.length) return null;
            return (
              <div key={sev}>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">
                  {SEVERIDADE_LABEL[sev]}
                </p>
                <div className="space-y-2">
                  {grupo.map((alerta) => (
                    <div
                      key={alerta.id}
                      className="rounded-2xl border border-white/8 bg-white/5 p-4"
                    >
                      <div className="flex items-start gap-3">
                        {/* Ícone */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                          style={{
                            background: `${SEVERIDADE_COR[alerta.severidade]}18`,
                            border: `1px solid ${SEVERIDADE_COR[alerta.severidade]}30`,
                          }}
                        >
                          {TIPO_ICONE[alerta.tipo]}
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {badgeSeveridade(alerta.severidade)}
                            <span className="text-xs text-white/30">{LABEL_ALERTA[alerta.tipo]}</span>
                            <span className="text-xs text-white/20">·</span>
                            <span className="text-xs text-white/20">
                              {alerta.area.nome}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-white mb-1">
                            {alerta.titulo}
                          </p>
                          <p className="text-xs text-white/40 leading-relaxed">
                            {alerta.mensagem}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-[10px] text-white/20">
                              {new Date(alerta.dataEvento).toLocaleDateString("pt-BR", {
                                weekday: "long",
                                day: "2-digit",
                                month: "long",
                                timeZone: "UTC",
                              })}
                            </p>
                            <BotaoMarcarLido alertaId={alerta.id} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Alertas lidos */}
      {lidos.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/20 mb-3">
            Histórico
          </p>
          <div className="space-y-2">
            {lidos.slice(0, 20).map((alerta) => (
              <div
                key={alerta.id}
                className="rounded-2xl border border-white/5 bg-white/2 p-4 opacity-60"
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{TIPO_ICONE[alerta.tipo]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-white/50 font-medium">{alerta.titulo}</p>
                      <span className="text-xs text-white/20">· {alerta.area.nome}</span>
                    </div>
                    <p className="text-[10px] text-white/20 mt-0.5">
                      {new Date(alerta.dataEvento).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                      {alerta.lidoEm &&
                        ` · lido em ${new Date(alerta.lidoEm).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                        })}`}
                    </p>
                  </div>
                  <span className="text-[10px] text-white/20 flex-shrink-0">
                    {LABEL_ALERTA[alerta.tipo]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
