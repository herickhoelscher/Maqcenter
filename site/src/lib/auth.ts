import { redirect } from "next/navigation";
import { db } from "./db";
import { readSession } from "./session";

// Data access layer for signed-in people. Every admin page and every
// Server Action calls one of these, since actions are public endpoints.

export type AdminUser = { id: string; name: string; email: string };
export type CustomerUser = { id: string; name: string; email: string; phone: string; document: string };

export async function getAdmin(): Promise<AdminUser | null> {
  const id = await readSession("admin");
  if (!id) return null;
  return db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdmin();
  if (!user) redirect("/admin/login");
  return user;
}

export async function getCustomer(): Promise<CustomerUser | null> {
  const id = await readSession("customer");
  if (!id) return null;
  return db.customer.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true, document: true } });
}

export async function requireCustomer(next: string): Promise<CustomerUser> {
  const customer = await getCustomer();
  if (!customer) redirect(`/conta/entrar?next=${encodeURIComponent(next)}`);
  return customer;
}

/** Keeps redirects inside the site (no open redirect via ?next=). */
export function safeNext(value: FormDataEntryValue | string | null | undefined, fallback: string): string {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/") && !v.startsWith("//") ? v : fallback;
}
