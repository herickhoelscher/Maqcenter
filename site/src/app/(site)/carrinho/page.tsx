import { CartView } from "@/components/cart/CartView";
import { PageHeader } from "@/components/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Carrinho", description: "Seu carrinho de compras.", path: "/carrinho", noindex: true });

export default function CartPage() {
  return (
    <>
      <PageHeader title="Carrinho" crumbs={[{ href: "/carrinho", label: "Carrinho" }]} />
      <div className="container-site py-10 lg:py-16">
        <CartView />
      </div>
    </>
  );
}
