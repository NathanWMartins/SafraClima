import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, Plus, ArrowRight, Lock } from "lucide-react";

const ADMIN_EMAIL = "nathanwillmartins@gmail.com";

const LIMITE_AREAS = { FREE: 1, PRO: 10 } as const;

const culturaLabel: Record<string, string> = {
  SOJA: "Soja",
  MILHO: "Milho",
  CAFE: "Café",
  ALGODAO: "Algodão",
  CANA: "Cana-de-açúcar",
  ARROZ: "Arroz",
  FEIJAO: "Feijão",
  TRIGO: "Trigo",
  OUTROS: "Outros",
};

export default async function AreasPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, plano: true },
  });

  const areas = await prisma.area.findMany({
    where: { userId, ativa: true },
    orderBy: { createdAt: "desc" },
  });

  const isAdmin = user?.email === ADMIN_EMAIL;
  const limite = isAdmin ? Infinity : LIMITE_AREAS[user?.plano ?? "FREE"];
  const atingiuLimite = areas.length >= limite;
  const isPro = user?.plano === "PRO";

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Minhas Áreas</h1>
          <p className="text-white/40 mt-1 text-sm">
            {areas.length === 0
              ? "Nenhuma área cadastrada ainda."
              : `${areas.length}${isAdmin ? "" : `/${limite}`} área${areas.length !== 1 ? "s" : ""} monitorada${areas.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {atingiuLimite ? (
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/30 font-semibold px-4 py-2.5 rounded-xl text-sm cursor-not-allowed select-none">
            <Lock className="w-4 h-4" strokeWidth={2} />
            Nova área
          </div>
        ) : (
          <Link
            href="/dashboard/areas/nova"
            className="flex items-center gap-2 bg-[#B2D5E5] text-[#020202] font-semibold px-4 py-2.5 rounded-xl hover:bg-[#B2D5E5]/80 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Nova área
          </Link>
        )}
      </div>

      {/* Banner de limite atingido */}
      {atingiuLimite && (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-400 mb-0.5">
              {isPro ? "Limite do plano Pro atingido" : "Limite do plano gratuito atingido"}
            </p>
            <p className="text-xs text-white/40 leading-relaxed">
              {isPro
                ? `Você já possui ${LIMITE_AREAS.PRO} áreas cadastradas, o máximo do plano Pro.`
                : `O plano gratuito permite apenas 1 área. Faça upgrade para o Pro e monitore até ${LIMITE_AREAS.PRO} áreas.`}
            </p>
            {!isPro && (
              <Link
                href="/#planos"
                className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#B2D5E5] hover:text-[#B2D5E5]/80 transition-colors"
              >
                Ver planos
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {areas.length === 0 && (
        <div className="rounded-2xl border border-white/8 bg-white/5 p-12 text-center">
          <div className="w-16 h-16 bg-[#B2D5E5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-[#B2D5E5]/60" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Cadastre sua primeira área</h2>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Adicione uma área com o endereço e a cultura plantada para monitorar o clima em tempo real.
          </p>
          <Link
            href="/dashboard/areas/nova"
            className="inline-flex items-center gap-2 bg-[#B2D5E5] text-[#020202] font-semibold px-6 py-3 rounded-xl hover:bg-[#B2D5E5]/80 transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Adicionar área
          </Link>
        </div>
      )}

      {/* Areas grid */}
      {areas.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/dashboard/areas/${area.id}`}
              className="group rounded-2xl border border-white/8 bg-white/5 p-5 hover:border-[#B2D5E5]/40 hover:bg-white/8 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#B2D5E5]/10 rounded-xl flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-[#B2D5E5]" strokeWidth={1.5} />
                </div>
                <span className="text-xs bg-[#B2D5E5]/10 text-[#B2D5E5] px-2.5 py-1 rounded-full font-medium">
                  {culturaLabel[area.cultura] ?? area.cultura}
                </span>
              </div>
              <p className="font-semibold text-white text-base mb-1">{area.nome}</p>
              <p className="text-xs text-white/25 mb-4 font-mono">
                {area.latitude.toFixed(4)}, {area.longitude.toFixed(4)}
              </p>
              <div className="flex items-center gap-1 text-xs text-white/20 group-hover:text-[#B2D5E5] transition-colors">
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2} />
                Ver dados climáticos
              </div>
            </Link>
          ))}

          {/* Card de nova área — só aparece se não atingiu o limite */}
          {!atingiuLimite && (
            <Link
              href="/dashboard/areas/nova"
              className="rounded-2xl border border-dashed border-white/10 p-5 flex flex-col items-center justify-center gap-2 hover:border-[#B2D5E5]/40 transition-colors text-white/20 hover:text-[#B2D5E5] min-h-[160px]"
            >
              <Plus className="w-6 h-6" strokeWidth={1.5} />
              <span className="text-sm font-medium">Nova área</span>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
