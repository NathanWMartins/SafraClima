import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Sprout } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  const user = session!.user;

  const areas = await prisma.area.findMany({
    where: { userId: user?.id!, ativa: true },
    orderBy: { createdAt: "desc" },
  });

  const primeiroAcesso = areas.length === 0;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          Olá, {user?.name?.split(" ")[0]}
          <Sprout className="w-6 h-6 text-[#B2D5E5]" />
        </h1>
        <p className="text-white/40 mt-1">
          {primeiroAcesso
            ? "Bem-vindo ao SafraClima! Vamos começar."
            : "Aqui está o resumo das suas áreas hoje."}
        </p>
      </div>

      {/* Estado: sem áreas */}
      {primeiroAcesso && (
        <div className="rounded-2xl border border-white/8 bg-white/5 p-8 text-center">
          <div className="w-16 h-16 bg-[#B2D5E5]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#B2D5E5]/60">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            Cadastre sua primeira área
          </h2>
          <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
            Adicione uma área com o endereço e a cultura plantada para começar a monitorar o clima em tempo real.
          </p>
          <Link
            href="/dashboard/areas/nova"
            className="inline-flex items-center gap-2 bg-[#B2D5E5] text-[#020202] font-semibold px-6 py-3 rounded-xl hover:bg-[#B2D5E5]/80 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Adicionar área
          </Link>
        </div>
      )}

      {/* Estado: com áreas */}
      {!primeiroAcesso && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <Link
              key={area.id}
              href={`/dashboard/areas/${area.id}`}
              className="rounded-2xl border border-white/8 bg-white/5 p-5 hover:border-[#B2D5E5]/40 hover:bg-white/8 transition-colors group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-white">{area.nome}</p>
                  <p className="text-xs text-white/40 mt-0.5">{area.cultura}</p>
                </div>
                <span className="text-xs bg-[#B2D5E5]/10 text-[#B2D5E5] px-2 py-1 rounded-full font-medium">
                  Ativo
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-white/20 group-hover:text-[#B2D5E5] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                Ver dados climáticos
              </div>
            </Link>
          ))}

          <Link
            href="/dashboard/areas/nova"
            className="rounded-2xl border border-dashed border-white/10 p-5 flex flex-col items-center justify-center gap-2 hover:border-[#B2D5E5]/40 transition-colors text-white/20 hover:text-[#B2D5E5]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span className="text-sm font-medium">Nova área</span>
          </Link>
        </div>
      )}
    </div>
  );
}