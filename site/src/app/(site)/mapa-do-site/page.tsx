import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getEquipment, getProducts } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Mapa do site",
  description: `Todas as páginas do site da MAQCENTER: locação, venda, assistência técnica, perfuração em concreto e contato.`,
  path: "/mapa-do-site",
});

export default async function SiteMapPage() {
  const [equipment, products] = await Promise.all([getEquipment(), getProducts()]);
  const sections = [
    {
      title: "Páginas",
      links: [
        { href: "/", label: "Início" },
        { href: "/sobre", label: "Sobre a loja" },
        { href: "/contato", label: "Fale conosco" },
        { href: "/orcamento", label: "Lista de orçamento" },
      ],
    },
    {
      title: "Serviços",
      links: [
        { href: "/locacoes", label: "Locação de equipamentos" },
        { href: "/venda-de-maquinas", label: "Venda de máquinas e acessórios" },
        { href: "/assistencia-tecnica", label: "Assistência técnica" },
        { href: "/perfuracao-em-concreto", label: "Perfuração em concreto" },
      ],
    },
    { title: "Equipamentos para locação", links: equipment.map((e) => ({ href: `/locacoes/${e.slug}`, label: e.name })) },
    { title: "Produtos à venda", links: products.map((p) => ({ href: "/venda-de-maquinas", label: p.name })) },
    {
      title: "Informações",
      links: [
        { href: "/politica-de-entrega", label: "Política de entrega" },
        { href: "/politica-de-privacidade", label: "Política de privacidade" },
        { href: "/termos-e-condicoes", label: "Termos e condições" },
      ],
    },
  ];
  return (
    <>
      <PageHeader title="Mapa do site" crumbs={[{ href: "/mapa-do-site", label: "Mapa do site" }]} />
      <div className="container-site grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3 lg:py-16">
        {sections.map((s) => (
          <section key={s.title} aria-labelledby={`mapa-${s.title}`} className="card p-6">
            <h2 id={`mapa-${s.title}`} className="text-title text-navy">
              {s.title}
            </h2>
            <ul className="mt-4 space-y-2 text-body">
              {s.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-blue-accent hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
