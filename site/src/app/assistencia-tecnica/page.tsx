import { ServicePage } from "@/components/ServicePage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = getService("assistencia-tecnica");

export const metadata = pageMetadata({
  title: "Assistência técnica de ferramentas elétricas em Cascavel",
  description:
    "Conserto de ferramentas elétricas Bosch, Black+Decker, Skil, DeWalt, Makita, Mirka, Stanley e Milwaukee em Cascavel - PR.",
  path: "/assistencia-tecnica",
  image: service.image?.src,
});

export default function TechnicalSupportPage() {
  return (
    <ServicePage service={service}>
      {service.brands && (
        <section aria-labelledby="marcas-atendidas">
          <h2 id="marcas-atendidas" className="font-display text-4xl">
            Marcas atendidas
          </h2>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {service.brands.map((b) => (
              <li key={b} className="rounded-sm border-2 border-ink bg-white px-3.5 py-2 font-semibold">
                {b}
              </li>
            ))}
          </ul>
        </section>
      )}
    </ServicePage>
  );
}
