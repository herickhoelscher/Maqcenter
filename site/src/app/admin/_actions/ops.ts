"use server";

import bcrypt from "bcryptjs";
import { refresh, updateTag } from "next/cache";
import type { FormState } from "@/components/forms/Form";
import { requireAdmin } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { db } from "@/lib/db";
import { isEmail } from "@/lib/validators";

/* ------------------------------------------------------------------ Orders */

export async function setOrderStatus(orderId: string, status: "paid" | "fulfilled" | "canceled" | "pending") {
  await requireAdmin();
  const order = await db.order.findUniqueOrThrow({ where: { id: orderId }, include: { items: true } });
  // Marking paid by hand (e.g. PIX straight to the store) also takes stock out once.
  const takeStock = status === "paid" && !order.stockApplied;
  // Canceling a paid order puts the stock back.
  const returnStock = status === "canceled" && order.stockApplied;
  await db.$transaction([
    db.order.update({
      where: { id: orderId },
      data: { status, ...(takeStock && { stockApplied: true }), ...(returnStock && { stockApplied: false }) },
    }),
    ...order.items
      .filter((i) => i.productId && (takeStock || returnStock))
      .map((i) => db.product.update({ where: { id: i.productId! }, data: { stock: takeStock ? { decrement: i.qty } : { increment: i.qty } } })),
  ]);
  if (takeStock || returnStock) updateTag(CONTENT_TAG);
  refresh();
}

/* ---------------------------------------------------------------- Messages */

export async function setMessageStatus(id: string, status: "new" | "read" | "archived") {
  await requireAdmin();
  await db.contactMessage.update({ where: { id }, data: { status } });
  refresh();
}

export async function deleteMessage(id: string) {
  await requireAdmin();
  await db.contactMessage.delete({ where: { id } });
  refresh();
}

/* ------------------------------------------------------------------- Users */

export async function createUser(_state: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (name.length < 2) return { error: "Informe o nome." };
  if (!isEmail(email)) return { error: "E-mail inválido." };
  if (password.length < 10) return { error: "A senha precisa ter pelo menos 10 caracteres." };
  if (await db.user.findUnique({ where: { email } })) return { error: "Já existe um usuário com esse e-mail." };
  await db.user.create({ data: { name, email, passwordHash: await bcrypt.hash(password, 12) } });
  refresh();
  return { ok: true, message: `Usuário ${email} criado.` };
}

export async function deleteUser(id: string) {
  const me = await requireAdmin();
  if (me.id === id) return { error: "Você não pode excluir o seu próprio usuário." };
  if ((await db.user.count()) <= 1) return { error: "O painel precisa de pelo menos um usuário." };
  await db.user.delete({ where: { id } });
  refresh();
  return {};
}

export async function changeOwnPassword(_state: FormState, fd: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const current = String(fd.get("current") ?? "");
  const password = String(fd.get("password") ?? "");
  const row = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await bcrypt.compare(current, row.passwordHash))) return { error: "A senha atual está incorreta." };
  if (password.length < 10) return { error: "A nova senha precisa ter pelo menos 10 caracteres." };
  await db.user.update({ where: { id: me.id }, data: { passwordHash: await bcrypt.hash(password, 12) } });
  return { ok: true, message: "Senha alterada." };
}
