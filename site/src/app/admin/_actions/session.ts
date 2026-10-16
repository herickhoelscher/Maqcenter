"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import type { FormState } from "@/components/forms/Form";
import { db } from "@/lib/db";
import { endSession, startSession } from "@/lib/session";

export async function adminLogin(_state: FormState, fd: FormData): Promise<FormState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // Slow down guessing a little.
    await new Promise((r) => setTimeout(r, 600));
    return { error: "E-mail ou senha incorretos." };
  }
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await startSession("admin", user.id);
  redirect("/admin");
}

export async function adminLogout() {
  await endSession("admin");
  redirect("/admin/login");
}
