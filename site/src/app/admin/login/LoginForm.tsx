"use client";

import { ActionForm, Field } from "@/components/forms/Form";
import { adminLogin } from "../_actions/session";

export function LoginForm() {
  return (
    <ActionForm action={adminLogin} submitLabel="Entrar" pendingLabel="Entrando...">
      <Field label="E-mail" name="email" type="email" autoComplete="username" required />
      <Field label="Senha" name="password" type="password" autoComplete="current-password" required />
    </ActionForm>
  );
}
