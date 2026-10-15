import { ServicePage } from "@/components/ServicePage";
import { getService } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

const service = getService("perfuracao-em-concreto");

export const metadata = pageMetadata({
  title: "Perfuração em concreto com perfuratriz diamantada em Cascavel",
  description: "Serviço de perfuração em concreto com perfuratriz diamantada em Cascavel - PR. Peça o orçamento pelo WhatsApp.",
  path: "/perfuracao-em-concreto",
  image: service.image?.src,
});

export default function ConcreteDrillingPage() {
  return <ServicePage service={service} />;
}
