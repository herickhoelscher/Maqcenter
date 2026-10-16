"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { confirmPayment, retryPayment } from "../../actions";

/** On return from Mercado Pago (?payment_id=), confirms the payment and refreshes. */
export function PaymentSync({ orderId, pending }: { orderId: string; pending: boolean }) {
  const params = useSearchParams();
  const router = useRouter();
  const { clear } = useCart();
  const done = useRef(false);
  const paymentId = params.get("payment_id") ?? params.get("collection_id");

  useEffect(() => {
    if (done.current || !paymentId) return;
    done.current = true;
    // Back from the checkout: the cart has become this order.
    clear();
    if (!pending) return;
    confirmPayment(orderId, paymentId).then(() => router.refresh());
  }, [orderId, paymentId, pending, clear, router]);

  return null;
}

export function PayNowButton({ orderId }: { orderId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(undefined);
          const res = await retryPayment(orderId);
          if (res.url) window.location.href = res.url;
          else {
            setError(res.error);
            setBusy(false);
          }
        }}
        className="btn btn-primary disabled:opacity-70"
      >
        {busy ? "Abrindo pagamento..." : "Pagar agora"}
      </button>
      {error && (
        <p role="alert" className="text-body-sm font-semibold text-crimson">
          {error}
        </p>
      )}
    </div>
  );
}
