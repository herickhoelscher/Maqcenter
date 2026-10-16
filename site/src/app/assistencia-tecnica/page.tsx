import { ServicePage } from "@/components/ServicePage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = getService("assistencia-tecnica");

export const metadata = pageMetadata({
  title: "Assistência técnica de ferramentas elétricas em Cascavel",
  description:
    "Conserto de ferramentas elétricas com avaliação técnica: cabo, chave, rolamentos, escovas e parte elétrica. Bosch, DeWalt, Makita, Milwaukee e outras marcas, em Cascavel - PR.",
  path: "/assistencia-tecnica",
  image: service.image?.src,
});

export default function TechnicalSupportPage() {
  return (
    <ServicePage service={service}>
      {service.symptoms && (
        <section aria-labelledby="sinais">
          <h2 id="sinais" className="font-display text-4xl">
            Sinais de que a máquina precisa de avaliação
          </h2>
          <ul className="mt-6 border-t-2 border-ink">
            {service.symptoms.map((s) => (
              <li key={s} className="border-b border-dashed border-line py-3 text-lg">
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}
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
