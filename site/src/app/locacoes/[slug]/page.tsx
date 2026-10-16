import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallButton, WhatsAppButton } from "@/components/Buttons";
import { CtaBand } from "@/components/CtaBand";
import { EquipmentCard } from "@/components/EquipmentCard";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { AddToQuoteButton } from "@/components/quote/QuoteControls";
import { company, formatPrice, getEquipment, getEquipmentBySlug } from "@/lib/content";
import { pageMetadata, productJsonLd } from "@/lib/seo";
import { equipmentMessage } from "@/lib/whatsapp";

export function generateStaticParams() {
  return getEquipment().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/locacoes/[slug]">) {
  const { slug } = await params;
  const item = getEquipmentBySlug(slug);
  if (!item) return {};
  return pageMetadata({
    title: `${item.name} para locação em Cascavel`,
    description:
      item.description?.join(" ").slice(0, 155) ??
      `Locação de ${item.name.toLowerCase()} em ${company.address.city} - ${company.address.state}. Peça o orçamento pelo WhatsApp.`,
    path: `/locacoes/${item.slug}`,
    image: item.images[0]?.src,
  });
}

export default async function EquipmentPage({ params }: PageProps<"/locacoes/[slug]">) {
  const { slug } = await params;
  const item = getEquipmentBySlug(slug);
  if (!item) notFound();

  const related = getEquipment()
    .filter((e) => e.slug !== item.slug)
    .sort((a, b) => Number(b.category === item.category) - Number(a.category === item.category))
    .slice(0, 3);
  const [cover, ...gallery] = item.images;

  return (
    <>
      <JsonLd data={productJsonLd(item)} />
      <PageHeader
        badge={item.category}
        badgeNote="Locação"
        title={item.name}
        crumbs={[
          { href: "/locacoes", label: "Locações de Equipamentos" },
          { href: `/locacoes/${item.slug}`, label: item.name },
        ]}
      />

      <div className="container-site grid gap-8 py-10 lg:grid-cols-12 lg:py-16">
        <div className="lg:col-span-6">
          <div className="card relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-concrete-50">
            <span className="badge absolute top-3 left-3 z-10 bg-navy text-white">Locação</span>
            {item.availability && (
              <span className="badge absolute top-3 right-3 z-10 bg-success-strong text-white">{item.availability}</span>
            )}
            {cover ? (
              <Image
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                sizes="(min-width: 1024px) 36rem, 92vw"
                priority
                className={cover.fit === "cover" ? "h-full w-full object-cover" : "h-[70%] w-auto object-contain"}
              />
            ) : (
              <span aria-hidden className="text-headline-m font-bold text-outline">
                Foto em breve
              </span>
            )}
          </div>
          {gallery.length > 0 && (
            <ul className="mt-4 grid grid-cols-4 gap-3">
              {gallery.map((img) => (
                <li key={img.src} className="card grid aspect-square place-items-center overflow-hidden bg-concrete-50">
                  <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="8rem" className="max-h-[85%] w-auto object-contain" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6 lg:col-span-6">
          <div className="flex items-center justify-between gap-3">
            <span className="text-spec tracking-wider text-outline uppercase">{item.category}</span>
            {item.brand && <span className="text-badge text-blue-accent uppercase">{item.brand}</span>}
          </div>

          <div className="space-y-4 text-body-lg text-slate-text">
            {item.description ? (
              item.description.map((p) => <p key={p}>{p}</p>)
            ) : (
              <p>
                Locação de {item.name.toLowerCase()} em {company.address.city}. Fale com a equipe para saber modelo, disponibilidade e valor.
              </p>
            )}
          </div>

          <section aria-labelledby="ficha" className="card overflow-hidden">
            <h2 id="ficha" className="border-b border-concrete-200 bg-concrete-50 px-5 py-3 text-title text-navy">
              Ficha técnica
            </h2>
            <table className="w-full text-body">
              <tbody>
                <tr className="border-b border-concrete-100">
                  <th scope="row" className="w-2/5 px-5 py-3 text-left text-spec text-outline">
                    Equipamento
                  </th>
                  <td className="px-5 py-3 font-semibold text-charcoal">{item.name}</td>
                </tr>
                <tr className="border-b border-concrete-100">
                  <th scope="row" className="px-5 py-3 text-left text-spec text-outline">
                    Categoria
                  </th>
                  <td className="px-5 py-3 text-charcoal">{item.category}</td>
                </tr>
                {item.brand && (
                  <tr className="border-b border-concrete-100">
                    <th scope="row" className="px-5 py-3 text-left text-spec text-outline">
                      Marca
                    </th>
                    <td className="px-5 py-3 text-charcoal">{item.brand}</td>
                  </tr>
                )}
                {item.specs.map((s) => (
                  <tr key={s.name} className="border-b border-concrete-100 last:border-b-0">
                    <th scope="row" className="px-5 py-3 text-left text-spec text-outline">
                      {s.name}
                    </th>
                    <td className="px-5 py-3 text-charcoal">{s.value}</td>
                  </tr>
                ))}
                {item.specs.length === 0 && (
                  <tr>
                    <th scope="row" className="px-5 py-3 text-left text-spec text-outline">
                      Especificações
                    </th>
                    <td className="px-5 py-3 text-charcoal">Informadas no orçamento</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <div className="card space-y-4 p-5">
            {item.priceDaily ? (
              <div>
                <span className="text-body-sm text-outline">Diária a partir de</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-headline-m font-extrabold text-navy">{formatPrice(item.priceDaily)}</span>
                  <span className="text-body text-slate-text">/dia</span>
                </div>
              </div>
            ) : (
              <p className="text-body text-slate-text">Valor e disponibilidade sob consulta</p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <WhatsAppButton message={equipmentMessage(item.name)}>Cotar pelo WhatsApp</WhatsAppButton>
              <AddToQuoteButton slug={item.slug} name={item.name} variant="full" />
              <CallButton />
            </div>
            <p className="text-body-sm text-outline">
              Precisa de mais de um equipamento?{" "}
              <Link href="/orcamento" className="font-semibold text-blue-accent underline">
                Veja sua lista de orçamento
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <section aria-labelledby="relacionados" className="bg-surface-low py-14">
        <div className="container-site">
          <h2 id="relacionados" className="text-headline-m text-navy">
            Outros equipamentos
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            {related.map((e) => (
              <li key={e.slug}>
                <EquipmentCard item={e} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBand title="Vai começar uma obra?" text="Monte sua lista com vários equipamentos e envie o pedido de orçamento de uma vez." />
    </>
  );
}
