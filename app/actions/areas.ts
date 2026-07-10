"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Cultura } from "@prisma/client";
import { redirect } from "next/navigation";

type ActionState = { error: string } | null;

const ADMIN_EMAIL = "nathanwillmartins@gmail.com";

const LIMITE_AREAS = {
  FREE: 1,
  PRO: 10,
} as const;

export async function criarArea(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autorizado." };

  const nome = (formData.get("nome") as string)?.trim();
  const cultura = formData.get("cultura") as Cultura;
  const lat = parseFloat(formData.get("lat") as string);
  const lng = parseFloat(formData.get("lng") as string);

  if (!nome) return { error: "Nome da área é obrigatório." };
  if (!cultura) return { error: "Selecione uma cultura." };
  if (isNaN(lat) || isNaN(lng)) return { error: "Ajuste a localização no mapa antes de salvar." };

  // Busca usuário com plano e contagem de áreas
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      plano: true,
      _count: { select: { areas: { where: { ativa: true } } } },
    },
  });

  if (!user) return { error: "Usuário não encontrado." };

  // Admin não tem limite
  const isAdmin = user.email === ADMIN_EMAIL;

  if (!isAdmin) {
    const limite = LIMITE_AREAS[user.plano];
    const totalAreas = user._count.areas;

    if (totalAreas >= limite) {
      if (user.plano === "FREE") {
        return {
          error: `Plano gratuito permite apenas ${limite} área. Faça upgrade para o plano Pro e monitore até ${LIMITE_AREAS.PRO} áreas.`,
        };
      }
      return {
        error: `Você atingiu o limite de ${limite} áreas do plano Pro.`,
      };
    }
  }

  try {
    await prisma.area.create({
      data: {
        nome,
        cultura,
        latitude: lat,
        longitude: lng,
        userId: session.user.id,
      },
    });
  } catch {
    return { error: "Erro ao salvar área. Tente novamente." };
  }

  redirect("/dashboard/areas");
}
