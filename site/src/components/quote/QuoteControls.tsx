"use client";

import Link from "next/link";
import { CheckIcon, ListIcon, PlusIcon } from "../icons";
import { useQuote } from "./QuoteProvider";

export function QuoteHeaderLink() {
  const { count, ready } = useQuote();
  const shown = ready ? count : 0;
  return (
    <Link
      href="/orcamento"
      className="relative flex items-center gap-3.5 rounded-[var(--radius-control)] bg-concrete-100 px-3 py-2 transition-colors hover:bg-concrete-200"
    >
      <span className="relative">
        <ListIcon className="size-6 text-navy" />
        <span
          aria-hidden
          className="absolute -top-1.5 -right-2 grid size-4 place-items-center rounded-full bg-amber text-[10px] font-bold text-charcoal"
        >
          {shown}
        </span>
      </span>
      <span className="hidden flex-col sm:flex">
        <span className="text-badge text-outline uppercase">Orçamento</span>
        <span className="text-spec font-bold text-navy">Itens ({shown})</span>
      </span>
      <span className="sr-only sm:hidden">Lista de orçamento, {shown} itens</span>
    </Link>
  );
}

export function AddToQuoteButton({
  slug,
  name,
  variant = "icon",
}: {
  slug: string;
  name: string;
  variant?: "icon" | "full";
}) {
  const { add, has, ready } = useQuote();
  const added = ready && has(slug);
  const label = added ? "Na lista de orçamento" : "Adicionar ao orçamento";

  if (variant === "full") {
    return (
      <button type="button" onClick={() => add({ slug, name })} className="btn btn-secondary w-full sm:w-auto">
        {added ? <CheckIcon className="size-5" /> : <PlusIcon className="size-5" />}
        {added ? "Adicionado (adicionar mais 1)" : "Adicionar ao orçamento"}
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => add({ slug, name })}
      aria-label={`${label}: ${name}`}
      title={label}
      className={`btn px-3 ${added ? "bg-navy text-white hover:bg-navy-deep" : "btn-muted"}`}
    >
      {added ? <CheckIcon className="size-5" /> : <PlusIcon className="size-5" />}
    </button>
  );
}
