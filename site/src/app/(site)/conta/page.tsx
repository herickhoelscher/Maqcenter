import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { requireCustomer } from "@/lib/auth";
import { formatCents } from "@/lib/content";
import { db } from "@/lib/db";
import { ORDER_STATUS_LABEL } from "@/lib/orders";
import { pageMetadata } from "@/lib/seo";
import { formatDocument } from "@/lib/validators";
import { signOut } from "./actions";
import { ProfileForm } from "./AccountForms";

export const metadata = pageMetadata({ title: "Minha conta", description: "Seus dados e pedidos na MAQCENTER.", path: "/conta", noindex: true });

export default function AccountPage() {
  return (
    <>
      <PageHeader title="Minha conta" crumbs={[{ href: "/conta", label: "Minha conta" }]} />
      <div className="container-site py-10 lg:py-16">
        <Suspense fallback={<div className="card h-96 animate-pulse" aria-hidden />}>
          <Account />
        </Suspense>
      </div>
    </>
  );
}

async function Account() {
  const customer = await requireCustomer("/conta");
  const orders = await db.order.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 3 });
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <section aria-labelledby="dados" className="card space-y-5 p-6 md:p-8 lg:col-span-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="dados" className="text-headline-sm text-navy">
              Seus dados
            </h2>
            <p className="text-body text-slate-text">
              {customer.email} · {formatDocument(customer.document)}
            </p>
          </div>
          <form action={signOut}>
            <button type="submit" className="btn btn-muted">
              Sair
            </button>
          </form>
        </div>
        <ProfileForm name={customer.name} phone={customer.phone} />
      </section>
      <section aria-labelledby="ultimos" className="card self-start p-6 lg:col-span-5">
        <div className="flex items-center justify-between">
          <h2 id="ultimos" className="text-headline-sm text-navy">
            Últimos pedidos
          </h2>
          <Link href="/conta/pedidos" className="text-btn font-bold text-blue-accent hover:underline">
            Ver todos
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="mt-4 text-body text-slate-text">
            Você ainda não fez pedidos.{" "}
            <Link href="/venda-de-maquinas" className="font-semibold text-blue-accent underline">
              Ver produtos
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-concrete-100">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/conta/pedidos/${o.id}`} className="flex items-center justify-between gap-3 py-3 hover:text-blue-accent">
                  <span>
                    <span className="block font-semibold text-navy">Pedido #{o.number}</span>
                    <span className="text-body-sm text-outline">{ORDER_STATUS_LABEL[o.status] ?? o.status}</span>
                  </span>
                  <span className="font-semibold">{formatCents(o.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
