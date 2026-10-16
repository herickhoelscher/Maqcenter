import { Suspense } from "react";
import { CheckoutForm } from "@/components/cart/CartView";
import { PageHeader } from "@/components/PageHeader";
import { requireCustomer } from "@/lib/auth";
import { formatAddress, getCompany } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Finalizar compra", description: "Finalize sua compra.", path: "/checkout", noindex: true });

export default function CheckoutPage() {
  return (
    <>
      <PageHeader
        title="Finalizar compra"
        crumbs={[
          { href: "/carrinho", label: "Carrinho" },
          { href: "/checkout", label: "Finalizar compra" },
        ]}
      />
      <div className="container-site py-10 lg:py-16">
        <Suspense fallback={<div className="card h-96 animate-pulse" aria-hidden />}>
          <Checkout />
        </Suspense>
      </div>
    </>
  );
}

async function Checkout() {
  const [customer, company] = await Promise.all([requireCustomer("/checkout"), getCompany()]);
  return <CheckoutForm customerName={customer.name} storeAddress={formatAddress(company)} />;
}
