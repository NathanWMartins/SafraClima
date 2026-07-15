"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TipoAlerta } from "@prisma/client";
import { revalidatePath } from "next/cache";

// ─── Marcar um alerta como lido ───────────────────────────────────────────────
export async function marcarComoLido(alertaId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" };

  await prisma.alerta.updateMany({
    where: { id: alertaId, userId: session.user.id },
    data: { lido: true, lidoEm: new Date() },
  });

  revalidatePath("/dashboard/alertas");
  return { ok: true };
}

// ─── Marcar todos alertas como lidos ─────────────────────────────────────────
export async function marcarTodosLidos() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" };

  await prisma.alerta.updateMany({
    where: { userId: session.user.id, lido: false },
    data: { lido: true, lidoEm: new Date() },
  });

  revalidatePath("/dashboard/alertas");
  return { ok: true };
}

// ─── Atualizar preferência de alerta ─────────────────────────────────────────
export async function atualizarPreferencia(
  tipo: TipoAlerta,
  ativo: boolean,
  limiar?: number | null
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Não autenticado" };

  await prisma.preferenciaAlerta.upsert({
    where: { userId_tipo: { userId: session.user.id, tipo } },
    create: {
      userId: session.user.id,
      tipo,
      ativo,
      limiar: limiar ?? null,
    },
    update: {
      ativo,
      limiar: limiar ?? null,
    },
  });

  revalidatePath("/dashboard/conta");
  return { ok: true };
}
