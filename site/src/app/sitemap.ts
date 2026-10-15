import type { MetadataRoute } from "next";
import { getEquipment, legal } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "", priority: 1 },
    { path: "/locacoes", priority: 0.9 },
    { path: "/assistencia-tecnica", priority: 0.8 },
    { path: "/venda-de-maquinas", priority: 0.8 },
    { path: "/perfuracao-em-concreto", priority: 0.8 },
    { path: "/sobre", priority: 0.5 },
    { path: "/contato", priority: 0.7 },
    { path: "/politica-de-privacidade", priority: 0.2 },
    ...(legal.terms.sections.length > 0 ? [{ path: "/termos-e-condicoes", priority: 0.2 }] : []),
    ...getEquipment().map((e) => ({ path: `/locacoes/${e.slug}`, priority: 0.7 })),
  ];
  return pages.map(({ path, priority }) => ({ url: `${siteUrl}${path}`, priority }));
}
