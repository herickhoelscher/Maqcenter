import { BrandGrid } from "@/components/BrandGrid";
import { ProductCard } from "@/components/ProductCard";
import { InfoList, ServicePage } from "@/components/ServicePage";
import { getProductGroups, getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = getService("venda-de-maquinas");

export const metadata = pageMetadata({
  title: "Venda de máquinas e acessórios em Cascavel",
  description:
    "Serra circular Bosch, furadeiras, parafusadeiras, esmerilhadeiras, serra-mármore, rompedores, brocas, discos, baterias e escovas de carvão em Cascavel - PR.",
  path: "/venda-de-maquinas",
  image: service.image?.src,
});

// Brands seen at the store: home page logos plus the Bosch promotion banner
// of the old site (Dremel, Skil, Freud, SIA).
const storeBrands = ["Bosch", "DeWalt", "Makita", "Milwaukee", "Black+Decker", "Mirka", "Skil", "Dremel", "Freud", "SIA"];

export default function MachineSalesPage() {
  const groups = getProductGroups();
  return (
    <ServicePage
      service={service}
      wide={
        <section aria-labelledby="produtos" className="bg-surface-mid py-14">
          <div className="container-site space-y-12">
            <div className="max-w-2xl space-y-2" data-reveal>
              <span className="badge bg-blue-accent/10 text-blue-accent">Produtos</span>
              <h2 id="produtos" className="text-headline-m text-navy md:text-headline">
                Máquinas, acessórios e peças
              </h2>
              <p className="text-body-lg text-slate-text">Cote pelo WhatsApp ou adicione à sua lista de orçamento.</p>
            </div>
            {groups.map((g) => (
              <div key={g.name} className="space-y-5">
                <h3 className="text-headline-sm text-navy">{g.name}</h3>
                <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {g.items.map((p, i) => (
                    <li key={p.slug} data-reveal style={{ "--reveal-delay": `${(i % 4) * 70}ms` } as React.CSSProperties}>
                      <ProductCard item={p} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      }
    >
      <InfoList id="marcas-loja" title="Marcas" items={storeBrands} />
      <section aria-labelledby="marcas-venda" className="space-y-4">
        <h2 id="marcas-venda" className="sr-only">
          Logos das marcas
        </h2>
        <BrandGrid />
      </section>
    </ServicePage>
  );
}
