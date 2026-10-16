import { ServicePage } from "@/components/ServicePage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  const service = await getService("perfuracao-em-concreto");
  return pageMetadata({
  title: "Perfuração em concreto com perfuratriz diamantada em Cascavel",
  description: "Serviço de perfuração em concreto com perfuratriz diamantada em Cascavel - PR. Peça o orçamento pelo WhatsApp.",
  path: "/perfuracao-em-concreto",
  image: service.image?.src,
  });
}

export default async function ConcreteDrillingPage() {
  const service = await getService("perfuracao-em-concreto");
  return <ServicePage service={service} />;
}
