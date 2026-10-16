"use client";

import Link from "next/link";
import { ActionForm, Field } from "@/components/forms/Form";
import { signIn, signUp, updateProfile } from "./actions";

export function SignInForm({ next }: { next: string }) {
  return (
    <ActionForm action={signIn} submitLabel="Entrar" pendingLabel="Entrando...">
      <input type="hidden" name="next" value={next} />
      <Field label="E-mail" name="email" type="email" autoComplete="email" required />
      <Field label="Senha" name="password" type="password" autoComplete="current-password" required />
      <p className="text-body-sm text-slate-text">
        Ainda não tem conta?{" "}
        <Link href={`/conta/cadastro?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-accent underline">
          Criar conta
        </Link>
      </p>
    </ActionForm>
  );
}

export function SignUpForm({ next }: { next: string }) {
  return (
    <ActionForm action={signUp} submitLabel="Criar conta" pendingLabel="Criando...">
      {(state) => (
        <>
          <input type="hidden" name="next" value={next} />
          <Field label="Nome completo" name="name" autoComplete="name" required error={state?.fieldErrors?.name} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="E-mail" name="email" type="email" autoComplete="email" required error={state?.fieldErrors?.email} />
            <Field label="Telefone ou WhatsApp" name="phone" type="tel" autoComplete="tel" placeholder="(45) 99999-9999" required error={state?.fieldErrors?.phone} />
          </div>
          <Field
            label="CPF ou CNPJ"
            name="document"
            inputMode="numeric"
            required
            hint="Usado na nota fiscal e no pagamento."
            error={state?.fieldErrors?.document}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Senha" name="password" type="password" autoComplete="new-password" required hint="Mínimo de 8 caracteres." error={state?.fieldErrors?.password} />
            <Field label="Confirme a senha" name="confirm" type="password" autoComplete="new-password" required error={state?.fieldErrors?.confirm} />
          </div>
          <p className="text-body-sm text-slate-text">
            Já tem conta?{" "}
            <Link href={`/conta/entrar?next=${encodeURIComponent(next)}`} className="font-semibold text-blue-accent underline">
              Entrar
            </Link>
            . Ao criar a conta você concorda com a{" "}
            <Link href="/politica-de-privacidade" className="underline">
              política de privacidade
            </Link>
            .
          </p>
        </>
      )}
    </ActionForm>
  );
}

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  return (
    <ActionForm action={updateProfile} submitLabel="Salvar alterações">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nome completo" name="name" defaultValue={name} autoComplete="name" required />
        <Field label="Telefone ou WhatsApp" name="phone" type="tel" defaultValue={phone} autoComplete="tel" required />
      </div>
      <fieldset className="space-y-4 rounded-[var(--radius-card)] border border-concrete-200 p-4">
        <legend className="px-1 text-body font-semibold text-navy">Trocar senha (opcional)</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Senha atual" name="current" type="password" autoComplete="current-password" />
          <Field label="Nova senha" name="password" type="password" autoComplete="new-password" hint="Mínimo de 8 caracteres." />
        </div>
      </fieldset>
    </ActionForm>
  );
}
