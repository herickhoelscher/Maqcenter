import { BrandGrid } from "@/components/BrandGrid";
import { InfoList, ServicePage } from "@/components/ServicePage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = getService("venda-de-maquinas");

export const metadata = pageMetadata({
  title: "Venda de máquinas e acessórios em Cascavel",
  description:
    "Furadeiras, parafusadeiras, esmerilhadeiras, serras, rompedores, brocas, discos e baterias. Milwaukee, Mirka, DeWalt, Bosch, Black+Decker e Makita em Cascavel - PR.",
  path: "/venda-de-maquinas",
});

export default function MachineSalesPage() {
  return (
    <ServicePage service={service}>
      {service.productLines?.map((line) => (
        <InfoList key={line.name} id={`linha-${line.name}`} title={line.name} items={line.items} />
      ))}
      <section aria-labelledby="marcas-venda" className="space-y-4">
        <h2 id="marcas-venda" className="text-headline-sm text-navy">
          Marcas
        </h2>
        <BrandGrid />
      </section>
    </ServicePage>
  );
}
