"use client";

import { useId, useState } from "react";
import { HONEYPOT_FIELD, serviceOptions, validateContact, type FieldErrors } from "@/lib/contact";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

const inputClass =
  "mt-1.5 block w-full rounded-md border-2 border-ink bg-white px-3.5 py-3 text-base placeholder:text-steel/70 aria-[invalid=true]:border-red-700";

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
      <p id={`${id}-${name}-error`} className="mt-1.5 text-sm font-medium text-red-700">
        {errors[name]}
      </p>
    );

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5" aria-describedby={`${id}-required`}>
      <p id={`${id}-required`} className="text-sm text-steel">
        Campos com * são obrigatórios.
      </p>
      <div>
        <label htmlFor={`${id}-name`} className="font-semibold">
          Nome *
        </label>
        <input {...field("name")} type="text" autoComplete="name" required className={inputClass} />
        {error("name")}
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-phone`} className="font-semibold">
            Telefone ou WhatsApp *
          </label>
          <input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="(45) 99999-9999" required className={inputClass} />
          {error("phone")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className="font-semibold">
            E-mail
          </label>
          <input {...field("email")} type="email" autoComplete="email" className={inputClass} />
          {error("email")}
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-service`} className="font-semibold">
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
        <label htmlFor={`${id}-message`} className="font-semibold">
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
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-blue px-6 font-semibold text-white hover:bg-blue-deep disabled:opacity-70"
        >
          {status.kind === "sending" ? "Enviando..." : "Enviar mensagem"}
        </button>
        <p role="status" aria-live="polite" className="text-[0.9375rem]">
          {status.kind === "sent" && <span className="font-semibold text-wa">Mensagem enviada para a MAQCENTER.</span>}
          {status.kind === "error" && <span className="font-semibold text-red-700">{status.message}</span>}
        </p>
      </div>
    </form>
  );
}
