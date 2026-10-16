import { InfoList, ServicePage } from "@/components/ServicePage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const service = await getService("assistencia-tecnica");
  return pageMetadata({
  title: "Assistência técnica de ferramentas elétricas em Cascavel",
  description:
    "Conserto de ferramentas elétricas com avaliação técnica: cabo, chave, rolamentos, escovas e parte elétrica. Bosch, DeWalt, Makita, Milwaukee e outras marcas, em Cascavel - PR.",
  path: "/assistencia-tecnica",
  image: service.image?.src,
  });
}

export default async function TechnicalSupportPage() {
  const service = await getService("assistencia-tecnica");
  return (
    <ServicePage service={service}>
      {service.symptoms && <InfoList id="sinais" title="Sinais de que a máquina precisa de avaliação" items={service.symptoms} />}
      {service.brands && <InfoList id="marcas-atendidas" title="Marcas atendidas" items={service.brands} />}
    </ServicePage>
  );
}
