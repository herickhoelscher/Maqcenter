import { BrandGrid } from "@/components/BrandGrid";
import { ServicePage } from "@/components/ServicePage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = getService("venda-de-maquinas");

export const metadata = pageMetadata({
  title: "Venda de máquinas e acessórios em Cascavel",
  description: "Máquinas e acessórios Milwaukee, Mirka, DeWalt, Bosch, Black+Decker e Makita em Cascavel - PR. Orçamento pelo WhatsApp.",
  path: "/venda-de-maquinas",
});

export default function MachineSalesPage() {
  return (
    <ServicePage service={service}>
      <section aria-labelledby="marcas-venda">
        <h2 id="marcas-venda" className="font-display text-4xl">
          Marcas
        </h2>
        <div className="mt-6">
          <BrandGrid />
        </div>
      </section>
    </ServicePage>
  );
}
