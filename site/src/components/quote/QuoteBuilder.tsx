"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { validateContact, type FieldErrors } from "@/lib/contact";
import { whatsappUrl } from "@/lib/whatsapp";
import { CalendarIcon, ListIcon, MailIcon, MinusIcon, PlusIcon, TrashIcon, WhatsAppIcon } from "../icons";
import { useQuote } from "./QuoteProvider";

const formatDate = (iso: string) => (iso ? iso.split("-").reverse().join("/") : "");

export function QuoteBuilder() {
  const { items, ready, setQty, remove, clear } = useQuote();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<FieldErrors & { dates?: string }>({});
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "sent" | "error"; message?: string }>({ kind: "idle" });
  const id = useId();

  const rentals = items.filter((i) => i.kind === "locacao");
  const sales = items.filter((i) => i.kind === "venda");

  function buildMessage(): string {
    const lines = ["Olá! Quero um orçamento:"];
    if (rentals.length) lines.push("", "Locação:", ...rentals.map((i) => `- ${i.qty}x ${i.name}`));
    if (sales.length) lines.push("", "Compra:", ...sales.map((i) => `- ${i.qty}x ${i.name}`));
    if (rentals.length && (start || end)) lines.push("", `Período da locação: ${formatDate(start) || "?"} a ${formatDate(end) || "?"}`);
    if (name) lines.push(`Nome: ${name}`);
    if (notes.trim()) lines.push("", notes.trim());
    return lines.join("\n");
  }

  function datesError(): string | undefined {
    if (start && end && end < start) return "A devolução deve ser depois do início.";
  }

  function sendWhatsApp() {
    const d = datesError();
    setErrors(d ? { dates: d } : {});
    if (d) return;
    window.open(whatsappUrl(buildMessage()), "_blank", "noopener");
  }

  async function sendEmail() {
    const service = sales.length === 0 ? "Locação de equipamentos" : rentals.length === 0 ? "Venda de máquinas e acessórios" : "Outro assunto";
    const payload = { name, phone, email, service, message: buildMessage(), website: "" };
    const { errors: found } = validateContact(payload);
    const d = datesError();
    const all = { ...found, ...(d && { dates: d }) };
    setErrors(all);
    if (Object.keys(all).length > 0) return;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus({ kind: "sent" });
        clear();
      } else {
        setStatus({ kind: "error", message: data.error ?? "Não foi possível enviar. Use o WhatsApp." });
      }
    } catch {
      setStatus({ kind: "error", message: "Sem conexão. Confira sua internet e tente de novo." });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="card space-y-3 p-8 text-center">
        <p className="text-headline-sm text-navy">Pedido de orçamento enviado para a MAQCENTER.</p>
        <Link href="/locacoes" className="btn btn-secondary">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  if (!ready) return <div className="card h-40 animate-pulse" aria-hidden />;

  if (items.length === 0) {
    return (
      <div className="card space-y-4 p-8 text-center">
        <ListIcon className="mx-auto size-10 text-outline" />
        <p className="text-title text-navy">Sua lista de orçamento está vazia.</p>
        <p className="text-body text-slate-text">Use o botão + nos equipamentos do catálogo para adicionar.</p>
        <Link href="/locacoes" className="btn btn-primary">
          Ver equipamentos
        </Link>
      </div>
    );
  }

  const err = (k: keyof typeof errors) =>
    errors[k] && (
      <p id={`${id}-${k}-error`} className="mt-1.5 text-body-sm font-semibold text-crimson">
        {errors[k]}
      </p>
    );
  const label = "text-body font-semibold text-navy";

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <section aria-labelledby={`${id}-itens`} className="card self-start overflow-hidden lg:col-span-7">
        <div className="flex items-center justify-between border-b border-concrete-200 bg-concrete-50 px-5 py-3">
          <h2 id={`${id}-itens`} className="text-title text-navy">
            Equipamentos ({items.length})
          </h2>
          <button type="button" onClick={clear} className="text-body-sm text-outline underline hover:text-crimson">
            Limpar lista
          </button>
        </div>
        <ul>
          {items.map((i) => (
            <li key={i.slug} className="flex flex-wrap items-center justify-between gap-3 border-b border-concrete-100 px-5 py-4 last:border-b-0">
              <span>
                <Link
                  href={i.kind === "venda" ? "/venda-de-maquinas" : `/locacoes/${i.slug}`}
                  className="block text-body-lg font-semibold text-navy hover:text-blue-accent"
                >
                  {i.name}
                </Link>
                <span className="text-body-sm text-outline">{i.kind === "venda" ? "Compra" : "Locação"}</span>
              </span>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-[var(--radius-control)] border border-concrete-300">
                  <button type="button" onClick={() => setQty(i.slug, i.qty - 1)} className="grid size-10 place-items-center hover:bg-concrete-100" aria-label={`Diminuir quantidade de ${i.name}`}>
                    <MinusIcon className="size-4" />
                  </button>
                  <span className="w-8 text-center font-bold" aria-label={`Quantidade: ${i.qty}`}>
                    {i.qty}
                  </span>
                  <button type="button" onClick={() => setQty(i.slug, i.qty + 1)} className="grid size-10 place-items-center hover:bg-concrete-100" aria-label={`Aumentar quantidade de ${i.name}`}>
                    <PlusIcon className="size-4" />
                  </button>
                </div>
                <button type="button" onClick={() => remove(i.slug)} className="grid size-10 place-items-center rounded-[var(--radius-control)] text-outline hover:bg-concrete-100 hover:text-crimson" aria-label={`Remover ${i.name}`}>
                  <TrashIcon className="size-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t border-concrete-200 px-5 py-3">
          <Link href="/locacoes" className="text-btn font-bold text-blue-accent hover:underline">
            + Adicionar mais equipamentos
          </Link>
        </div>
      </section>

      <section aria-labelledby={`${id}-dados`} className="card self-start space-y-5 p-5 lg:col-span-5">
        <h2 id={`${id}-dados`} className="text-title text-navy">
          Período e contato
        </h2>
        <fieldset hidden={rentals.length === 0}>
          <legend className={`${label} mb-1.5 flex items-center gap-2`}>
            <CalendarIcon className="size-4 text-blue-accent" />
            Período da locação
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor={`${id}-start`} className="text-body-sm text-outline">
                Data de início
              </label>
              <input id={`${id}-start`} type="date" value={start} onChange={(e) => setStart(e.target.value)} className="field mt-1" aria-invalid={errors.dates ? true : undefined} />
            </div>
            <div>
              <label htmlFor={`${id}-end`} className="text-body-sm text-outline">
                Data de devolução
              </label>
              <input id={`${id}-end`} type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className="field mt-1" aria-invalid={errors.dates ? true : undefined} />
            </div>
          </div>
          {err("dates")}
        </fieldset>
        <div>
          <label htmlFor={`${id}-name`} className={label}>
            Nome
          </label>
          <input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="field mt-1.5" aria-invalid={errors.name ? true : undefined} aria-describedby={errors.name ? `${id}-name-error` : undefined} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={label}>
            Telefone ou WhatsApp
          </label>
          <input id={`${id}-phone`} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="(45) 99999-9999" className="field mt-1.5" aria-invalid={errors.phone ? true : undefined} aria-describedby={errors.phone ? `${id}-phone-error` : undefined} />
          {err("phone")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={label}>
            E-mail <span className="font-normal text-outline">(opcional)</span>
          </label>
          <input id={`${id}-email`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="field mt-1.5" aria-invalid={errors.email ? true : undefined} aria-describedby={errors.email ? `${id}-email-error` : undefined} />
          {err("email")}
        </div>
        <div>
          <label htmlFor={`${id}-notes`} className={label}>
            Observações <span className="font-normal text-outline">(opcional)</span>
          </label>
          <textarea id={`${id}-notes`} rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex.: endereço da obra, tipo de serviço" className="field mt-1.5" />
        </div>
        <div className="grid gap-3">
          <button type="button" onClick={sendWhatsApp} className="btn btn-primary">
            <WhatsAppIcon className="size-5" />
            Enviar pelo WhatsApp
          </button>
          <button type="button" onClick={sendEmail} disabled={status.kind === "sending"} className="btn btn-secondary disabled:opacity-70">
            <MailIcon className="size-5" />
            {status.kind === "sending" ? "Enviando..." : "Enviar por e-mail"}
          </button>
          <p role="status" aria-live="polite" className="text-body-sm">
            {status.kind === "error" ? <span className="font-semibold text-crimson">{status.message}</span> : <span className="text-outline">Pelo WhatsApp a mensagem já vai pronta. Por e-mail, nome e telefone são obrigatórios.</span>}
          </p>
        </div>
      </section>
    </div>
  );
}
