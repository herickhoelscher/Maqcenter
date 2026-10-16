"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckIcon } from "../icons";
import { useCart } from "./CartProvider";

function CartIcon({ className = "size-6" }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.5L21 8H6.2" />
      <circle cx="10" cy="20.5" r="1.2" />
      <circle cx="17" cy="20.5" r="1.2" />
    </svg>
  );
}

export function CartHeaderLink() {
  const { count, ready } = useCart();
  const shown = ready ? count : 0;
  return (
    <Link href="/carrinho" className="relative flex items-center gap-3.5 rounded-[var(--radius-control)] bg-concrete-100 px-3 py-2 transition-colors hover:bg-concrete-200">
      <span className="relative">
        <CartIcon className="size-6 text-navy" />
        <span
          key={shown}
          aria-hidden
          className={`absolute -top-1.5 -right-2 grid size-4 place-items-center rounded-full bg-amber text-[10px] font-bold text-charcoal ${shown > 0 ? "anim-bump" : ""}`}
        >
          {shown}
        </span>
      </span>
      <span className="hidden flex-col xl:flex">
        <span className="text-badge text-outline uppercase">Carrinho</span>
        <span className="text-spec font-bold text-navy">Itens ({shown})</span>
      </span>
      <span className="sr-only xl:hidden">Carrinho, {shown} itens</span>
    </Link>
  );
}

export function AddToCartButton({
  product,
  disabled = false,
  className = "",
}: {
  product: { productId: string; slug: string; name: string; priceCents: number; image?: string };
  disabled?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        add(product);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
      className={`btn btn-primary disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {added ? <CheckIcon className="size-5" /> : <CartIcon className="size-5" />}
      {disabled ? "Sem estoque" : added ? "Adicionado" : "Comprar"}
    </button>
  );
}
