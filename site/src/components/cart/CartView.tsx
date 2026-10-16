"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createCheckout } from "@/app/(site)/conta/actions";
import { MinusIcon, PlusIcon, TrashIcon } from "../icons";
import { useCart } from "./CartProvider";

const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function CartView() {
  const { items, ready, totalCents, setQty, remove } = useCart();

  if (!ready) return <div className="card h-40 animate-pulse" aria-hidden />;
  if (items.length === 0) {
    return (
      <div className="card space-y-4 p-8 text-center">
        <p className="text-title text-navy">Seu carrinho está vazio.</p>
        <Link href="/venda-de-maquinas" className="btn btn-primary">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <section aria-label="Itens do carrinho" className="card self-start overflow-hidden lg:col-span-8">
        <ul className="divide-y divide-concrete-100">
          {items.map((i) => (
            <li key={i.productId} className="flex flex-wrap items-center gap-4 p-5">
              <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-control)] bg-concrete-50">
                {i.image && <Image src={i.image} alt="" width={64} height={64} className="size-16 object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-navy">{i.name}</p>
                <p className="text-body-sm text-outline">{brl(i.priceCents)} cada</p>
              </div>
              <div className="flex items-center rounded-[var(--radius-control)] border border-concrete-300">
                <button type="button" onClick={() => setQty(i.productId, i.qty - 1)} className="grid size-10 place-items-center hover:bg-concrete-100" aria-label={`Diminuir quantidade de ${i.name}`}>
                  <MinusIcon className="size-4" />
                </button>
                <span className="w-8 text-center font-bold">{i.qty}</span>
                <button type="button" onClick={() => setQty(i.productId, i.qty + 1)} className="grid size-10 place-items-center hover:bg-concrete-100" aria-label={`Aumentar quantidade de ${i.name}`}>
                  <PlusIcon className="size-4" />
                </button>
              </div>
              <p className="w-24 text-right font-semibold">{brl(i.qty * i.priceCents)}</p>
              <button type="button" onClick={() => remove(i.productId)} className="grid size-10 place-items-center rounded-[var(--radius-control)] text-outline hover:bg-concrete-100 hover:text-crimson" aria-label={`Remover ${i.name}`}>
                <TrashIcon className="size-5" />
              </button>
            </li>
          ))}
        </ul>
      </section>
      <aside className="card space-y-4 self-start p-5 lg:col-span-4">
        <h2 className="text-title text-navy">Resumo</h2>
        <div className="flex items-center justify-between text-body">
          <span className="text-slate-text">Subtotal</span>
          <span className="text-headline-sm font-extrabold text-navy">{brl(totalCents)}</span>
        </div>
        <p className="text-body-sm text-outline">Retirada na loja ou entrega a combinar em Cascavel. Pagamento por PIX, cartão ou boleto no Mercado Pago.</p>
        <Link href="/checkout" className="btn btn-primary w-full">
          Finalizar compra
        </Link>
        <Link href="/venda-de-maquinas" className="btn btn-muted w-full">
          Continuar comprando
        </Link>
      </aside>
    </div>
  );
}

export function CheckoutForm({ customerName, storeAddress }: { customerName: string; storeAddress: string }) {
  const { items, ready, totalCents } = useCart();
  const [delivery, setDelivery] = useState<"retirada" | "entrega">("retirada");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  if (!ready) return <div className="card h-40 animate-pulse" aria-hidden />;
  if (items.length === 0) {
    return (
      <div className="card space-y-4 p-8 text-center">
        <p className="text-title text-navy">Seu carrinho está vazio.</p>
        <Link href="/venda-de-maquinas" className="btn btn-primary">
          Ver produtos
        </Link>
      </div>
    );
  }

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    const res = await createCheckout({
      items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      deliveryMethod: delivery,
      deliveryAddress: address,
      notes,
    });
    if (res.url) {
      window.location.href = res.url;
      return;
    }
    setError(res.error);
    setBusy(false);
  }

  return (
    <form onSubmit={pay} className="grid gap-8 lg:grid-cols-12">
      <div className="card space-y-6 p-6 lg:col-span-7">
        <p className="text-body text-slate-text">
          Comprando como <strong className="text-navy">{customerName}</strong>.
        </p>
        <fieldset className="space-y-3">
          <legend className="mb-2 text-title text-navy">Como você quer receber?</legend>
          {(
            [
              ["retirada", "Retirada na loja", storeAddress],
              ["entrega", "Entrega a combinar", "A equipe entra em contato pelo WhatsApp para combinar prazo e valor da entrega."],
            ] as const
          ).map(([value, label, hint]) => (
            <label
              key={value}
              className={`flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border p-4 ${delivery === value ? "border-blue-accent bg-blue-accent/5" : "border-concrete-200"}`}
            >
              <input type="radio" name="delivery" value={value} checked={delivery === value} onChange={() => setDelivery(value)} className="mt-1 accent-blue-accent" />
              <span>
                <span className="block font-semibold text-navy">{label}</span>
                <span className="text-body-sm text-slate-text">{hint}</span>
              </span>
            </label>
          ))}
        </fieldset>
        {delivery === "entrega" && (
          <div>
            <label htmlFor="address" className="text-body font-semibold text-navy">
              Endereço de entrega
            </label>
            <textarea id="address" rows={3} required value={address} onChange={(e) => setAddress(e.target.value)} className="field mt-1.5" placeholder="Rua, número, bairro, cidade" />
          </div>
        )}
        <div>
          <label htmlFor="notes" className="text-body font-semibold text-navy">
            Observações <span className="font-normal text-outline">(opcional)</span>
          </label>
          <textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="field mt-1.5" />
        </div>
      </div>
      <aside className="card space-y-4 self-start p-5 lg:col-span-5">
        <h2 className="text-title text-navy">Seu pedido</h2>
        <ul className="divide-y divide-concrete-100 text-body">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3 py-2">
              <span>
                {i.qty} × {i.name}
              </span>
              <span className="font-semibold">{brl(i.qty * i.priceCents)}</span>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-concrete-200 pt-3">
          <span className="font-semibold text-slate-text">Total</span>
          <span className="text-headline-sm font-extrabold text-navy">{brl(totalCents)}</span>
        </div>
        <button type="submit" disabled={busy} className="btn btn-primary w-full disabled:opacity-70">
          {busy ? "Abrindo pagamento..." : "Pagar com Mercado Pago"}
        </button>
        <p className="text-body-sm text-outline">Você vai para a página segura do Mercado Pago para pagar com PIX, cartão ou boleto.</p>
        {error && (
          <p role="alert" className="text-body font-semibold text-crimson">
            {error}
          </p>
        )}
      </aside>
    </form>
  );
}
