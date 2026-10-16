"use client";

import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { HONEYPOT_FIELD, serviceOptions, subjectParams, validateContact, type FieldErrors } from "@/lib/contact";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const inputClass = "field mt-1.5 placeholder:text-outline";

export function ContactForm({ defaultService }: { defaultService?: string }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const id = useId();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const { errors: localErrors } = validateContact(payload);
    setErrors(localErrors);
    if (Object.keys(localErrors).length > 0) {
      // Field order in the form, so focus lands on the first visible problem.
      const first = (["name", "phone", "email", "service", "message"] as const).find((k) => localErrors[k]);
      if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
      setStatus({ kind: "idle" });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        form.reset();
        setStatus({ kind: "sent" });
      } else if (data.errors) {
        setErrors(data.errors);
        setStatus({ kind: "idle" });
      } else {
        setStatus({ kind: "error", message: data.error ?? "Não foi possível enviar. Tente pelo WhatsApp." });
      }
    } catch {
      setStatus({ kind: "error", message: "Sem conexão. Confira sua internet e tente de novo." });
    }
  }

  const field = (name: keyof FieldErrors) => ({
    id: `${id}-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-error` : undefined,
  });

  const error = (name: keyof FieldErrors) =>
    errors[name] && (
      <p id={`${id}-${name}-error`} className="mt-1.5 text-body-sm font-semibold text-crimson">
        {errors[name]}
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-describedby={`${id}-required`}>
      <p id={`${id}-required`} className="text-body-sm text-outline">
        Campos com * são obrigatórios.
      </p>
      <div>
        <label htmlFor={`${id}-name`} className="text-body font-semibold text-navy">
          Nome *
        </label>
        <input {...field("name")} type="text" autoComplete="name" required className={inputClass} />
        {error("name")}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-phone`} className="text-body font-semibold text-navy">
            Telefone ou WhatsApp *
          </label>
          <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="(45) 99999-9999" required className={inputClass} />
          {error("phone")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="text-body font-semibold text-navy">
            E-mail
          </label>
          <input {...field("email")} type="email" autoComplete="email" className={inputClass} />
          {error("email")}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-service`} className="text-body font-semibold text-navy">
          Assunto *
        </label>
        <select {...field("service")} defaultValue={defaultService ?? ""} required className={inputClass}>
          <option value="" disabled>
            Escolha uma opção
          </option>
          {serviceOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {error("service")}
      </div>
      <div>
        <label htmlFor={`${id}-message`} className="text-body font-semibold text-navy">
          Mensagem *
        </label>
        <textarea
          {...field("message")}
          rows={5}
          required
          placeholder="Ex.: preciso de um compactador de solo por 3 dias"
          className={inputClass}
        />
        {error("message")}
      </div>
      {/* Honeypot: hidden from people and assistive tech, filled by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-hp`}>Não preencha este campo</label>
        <input id={`${id}-hp`} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="btn btn-primary px-8 disabled:opacity-70"
        >
          {status.kind === "sending" ? "Enviando..." : "Enviar mensagem"}
        </button>
        <p role="status" aria-live="polite" className="text-body">
          {status.kind === "sent" && <span className="font-semibold text-success-strong">Mensagem enviada para a MAQCENTER.</span>}
          {status.kind === "error" && <span className="font-semibold text-crimson">{status.message}</span>}
        </p>
      </div>
    </form>
  );
}

export function ContactFormFromParams() {
  const assunto = useSearchParams().get("assunto") ?? "";
  return <ContactForm key={assunto} defaultService={subjectParams[assunto]} />;
}
