import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ContaTabs } from "./ContaTabs";

export default async function ContaPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      image: true,
      plano: true,
      planoAtéEm: true,
      preferenciasAlertas: {
        select: { tipo: true, ativo: true, limiar: true },
      },
    },
  });

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Conta</h1>
      <ContaTabs
        user={{
          name: user.name,
          email: user.email,
          image: user.image,
          plano: user.plano,
          planoAtéEm: user.planoAtéEm,
        }}
        preferencias={user.preferenciasAlertas}
      />
    </div>
  );
}
