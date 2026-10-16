"use server";

import bcrypt from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/forms/Form";
import { getCustomer, requireCustomer, safeNext } from "@/lib/auth";
import { db } from "@/lib/db";
import { createPreference, paymentsConfigured } from "@/lib/mercadopago";
import { nextOrderNumber, syncPayment } from "@/lib/orders";
import { siteUrl } from "@/lib/seo";
import { endSession, startSession } from "@/lib/session";
import { isDocument, isEmail, onlyDigits } from "@/lib/validators";

const text = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);

export async function signUp(_state: FormState, fd: FormData): Promise<FormState> {
  const name = text(fd, "name", 120);
  const email = text(fd, "email", 160).toLowerCase();
  const phone = text(fd, "phone", 30);
  const document = onlyDigits(text(fd, "document", 30));
  const password = String(fd.get("password") ?? "");
  const confirm = String(fd.get("confirm") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (name.length < 3) fieldErrors.name = "Informe seu nome completo.";
  if (!isEmail(email)) fieldErrors.email = "Informe um e-mail válido.";
  if (onlyDigits(phone).length < 10) fieldErrors.phone = "Informe um telefone com DDD.";
  if (!isDocument(document)) fieldErrors.document = "CPF ou CNPJ inválido.";
  if (password.length < 8) fieldErrors.password = "A senha precisa ter pelo menos 8 caracteres.";
  if (password !== confirm) fieldErrors.confirm = "As senhas não conferem.";
  if (Object.keys(fieldErrors).length) return { error: "Confira os campos destacados.", fieldErrors };

  if (await db.customer.findUnique({ where: { email } })) {
    return { error: "Já existe uma conta com esse e-mail. Entre com sua senha.", fieldErrors: { email: "E-mail já cadastrado." } };
  }

  const customer = await db.customer.create({
    data: { name, email, phone, document, passwordHash: await bcrypt.hash(password, 12) },
  });
  await startSession("customer", customer.id);
  redirect(safeNext(fd.get("next"), "/conta"));
}

export async function signIn(_state: FormState, fd: FormData): Promise<FormState> {
  const email = text(fd, "email", 160).toLowerCase();
  const password = String(fd.get("password") ?? "");
  const customer = await db.customer.findUnique({ where: { email } });
  // Same answer for unknown e-mail and wrong password.
  if (!customer || !(await bcrypt.compare(password, customer.passwordHash))) {
    return { error: "E-mail ou senha incorretos." };
  }
  await db.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date() } });
  await startSession("customer", customer.id);
  redirect(safeNext(fd.get("next"), "/conta"));
}

export async function signOut() {
  await endSession("customer");
  redirect("/");
}

export async function updateProfile(_state: FormState, fd: FormData): Promise<FormState> {
  const customer = await requireCustomer("/conta");
  const name = text(fd, "name", 120);
  const phone = text(fd, "phone", 30);
  const current = String(fd.get("current") ?? "");
  const password = String(fd.get("password") ?? "");

  if (name.length < 3) return { error: "Informe seu nome completo." };
  if (onlyDigits(phone).length < 10) return { error: "Informe um telefone com DDD." };

  let passwordHash: string | undefined;
  if (password) {
    const row = await db.customer.findUniqueOrThrow({ where: { id: customer.id } });
    if (!(await bcrypt.compare(current, row.passwordHash))) return { error: "A senha atual está incorreta." };
    if (password.length < 8) return { error: "A nova senha precisa ter pelo menos 8 caracteres." };
    passwordHash = await bcrypt.hash(password, 12);
  }

  await db.customer.update({ where: { id: customer.id }, data: { name, phone, ...(passwordHash && { passwordHash }) } });
  return { ok: true, message: passwordHash ? "Dados e senha atualizados." : "Dados atualizados." };
}

export type CheckoutInput = {
  items: { productId: string; qty: number }[];
  deliveryMethod: "retirada" | "entrega";
  deliveryAddress: string;
  notes: string;
};

/** Creates the order from the cart (prices and stock from the database) and returns the Mercado Pago URL. */
export async function createCheckout(input: CheckoutInput): Promise<{ url?: string; error?: string }> {
  const customer = await getCustomer();
  if (!customer) return { error: "Entre na sua conta para finalizar a compra." };
  if (!paymentsConfigured()) {
    return { error: "O pagamento online ainda não está ativo. Fale com a loja pelo WhatsApp para fechar o pedido." };
  }

  const wanted = new Map<string, number>();
  for (const i of input.items ?? []) {
    const qty = Math.floor(Number(i.qty));
    if (typeof i.productId === "string" && qty > 0) wanted.set(i.productId, Math.min(99, (wanted.get(i.productId) ?? 0) + qty));
  }
  if (wanted.size === 0) return { error: "Seu carrinho está vazio." };

  const delivery = input.deliveryMethod === "entrega" ? "entrega" : "retirada";
  const address = String(input.deliveryAddress ?? "").trim().slice(0, 300);
  if (delivery === "entrega" && address.length < 8) return { error: "Informe o endereço de entrega." };

  const products = await db.product.findMany({ where: { id: { in: [...wanted.keys()] } } });
  const lines = [];
  for (const [id, qty] of wanted) {
    const p = products.find((x) => x.id === id);
    if (!p || !p.active || p.priceCents == null) return { error: "Um dos produtos não está mais à venda. Atualize o carrinho." };
    if (p.stock < qty) return { error: `Estoque insuficiente de "${p.name}" (disponível: ${p.stock}).` };
    lines.push({ product: p, qty });
  }
  const totalCents = lines.reduce((n, l) => n + l.product.priceCents! * l.qty, 0);

  let order;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    try {
      order = await db.order.create({
        data: {
          number: await nextOrderNumber(),
          customerId: customer.id,
          deliveryMethod: delivery,
          deliveryAddress: delivery === "entrega" ? address : null,
          notes: String(input.notes ?? "").trim().slice(0, 1000) || null,
          totalCents,
          items: {
            create: lines.map((l) => ({ productId: l.product.id, name: l.product.name, unitCents: l.product.priceCents!, qty: l.qty })),
          },
        },
      });
    } catch (err) {
      if (attempt === 2) throw err; // order number taken by a concurrent checkout: retry
    }
  }
  if (!order) return { error: "Não foi possível criar o pedido. Tente de novo." };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const baseUrl = host ? `${proto}://${host}` : siteUrl;

  try {
    const pref = await createPreference({
      orderId: order.id,
      orderNumber: order.number,
      items: lines.map((l) => ({ id: l.product.id, title: l.product.name, quantity: l.qty, unitCents: l.product.priceCents! })),
      payer: { name: customer.name, email: customer.email },
      baseUrl,
    });
    await db.order.update({ where: { id: order.id }, data: { mpPreferenceId: pref.id } });
    return { url: pref.url };
  } catch (err) {
    console.error("checkout:", err);
    await db.order.update({ where: { id: order.id }, data: { status: "canceled", notes: "Falha ao abrir o pagamento" } });
    return { error: "Não foi possível abrir o pagamento agora. Tente de novo em instantes." };
  }
}

/** Called when the buyer returns from Mercado Pago with ?payment_id=. */
export async function confirmPayment(orderId: string, paymentId: string): Promise<{ status?: string }> {
  const customer = await getCustomer();
  if (!customer || !paymentsConfigured()) return {};
  const order = await db.order.findFirst({ where: { id: orderId, customerId: customer.id } });
  if (!order || !/^\d+$/.test(paymentId)) return {};
  const result = await syncPayment(paymentId);
  return result?.orderId === order.id ? { status: result.status } : {};
}

/** Opens a new Mercado Pago checkout for an order still waiting for payment. */
export async function retryPayment(orderId: string): Promise<{ url?: string; error?: string }> {
  const customer = await getCustomer();
  if (!customer) return { error: "Entre na sua conta." };
  if (!paymentsConfigured()) return { error: "O pagamento online ainda não está ativo." };
  const order = await db.order.findFirst({ where: { id: orderId, customerId: customer.id }, include: { items: true } });
  if (!order || order.status !== "pending") return { error: "Este pedido não está aguardando pagamento." };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const baseUrl = host ? `${h.get("x-forwarded-proto") ?? "http"}://${host}` : siteUrl;
  try {
    const pref = await createPreference({
      orderId: order.id,
      orderNumber: order.number,
      items: order.items.map((i) => ({ id: i.productId ?? i.id, title: i.name, quantity: i.qty, unitCents: i.unitCents })),
      payer: { name: customer.name, email: customer.email },
      baseUrl,
    });
    await db.order.update({ where: { id: order.id }, data: { mpPreferenceId: pref.id } });
    return { url: pref.url };
  } catch (err) {
    console.error("retry payment:", err);
    return { error: "Não foi possível abrir o pagamento agora." };
  }
}
