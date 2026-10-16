import { BrandGrid } from "@/components/BrandGrid";
import { ServicePage } from "@/components/ServicePage";
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
      {service.productLines && (
        <section aria-labelledby="linhas" className="grid gap-8 sm:grid-cols-2">
          <h2 id="linhas" className="sr-only">
            Linhas de produto
          </h2>
          {service.productLines.map((line) => (
            <div key={line.name}>
              <h3 className="font-display text-3xl">{line.name}</h3>
              <ul className="mt-4 border-t-2 border-ink">
                {line.items.map((item) => (
                  <li key={item} className="border-b border-dashed border-line py-2.5 text-lg">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}
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
