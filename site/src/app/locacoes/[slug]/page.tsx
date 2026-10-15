import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CallButton, WhatsAppButton } from "@/components/Buttons";
import { EquipmentCard } from "@/components/EquipmentCard";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Plate, PlateRow } from "@/components/Plate";
import { company, getEquipment, getEquipmentBySlug } from "@/lib/content";
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
      item.description?.slice(0, 155) ??
      `Locação de ${item.name.toLowerCase()} em ${company.address.city} - ${company.address.state}. Peça o orçamento pelo WhatsApp.`,
    path: `/locacoes/${item.slug}`,
    image: item.images[0]?.src,
  });
}

export default async function EquipmentPage({ params }: PageProps<"/locacoes/[slug]">) {
  const { slug } = await params;
  const item = getEquipmentBySlug(slug);
  if (!item) notFound();

  const others = getEquipment().filter((e) => e.slug !== item.slug);
  const [cover, ...gallery] = item.images;

  return (
    <>
      <JsonLd data={productJsonLd(item)} />
      <PageHeader
        eyebrow="Locação"
        title={item.name}
        crumbs={[
          { href: "/locacoes", label: "Locações" },
          { href: `/locacoes/${item.slug}`, label: item.name },
        ]}
      />

      <div className="container-site grid gap-10 py-12 md:py-16 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
        <div>
          <Plate label={item.name} aside="Foto">
            <div className="mt-1.5 grid aspect-square place-items-center rounded-sm bg-white">
              {cover ? (
                <Image
                  src={cover.src}
                  alt={cover.alt}
                  width={cover.width}
                  height={cover.height}
                  sizes="(min-width: 1024px) 28rem, 90vw"
                  priority
                  className="h-auto max-h-[80%] w-auto max-w-[80%] object-contain"
                />
              ) : (
                <span aria-hidden className="font-display px-6 text-center text-5xl text-line">
                  {item.name}
                </span>
              )}
            </div>
          </Plate>
          {gallery.length > 0 && (
            <ul className="mt-4 grid grid-cols-3 gap-3">
              {gallery.map((img) => (
                <li key={img.src} className="grid aspect-square place-items-center border-2 border-ink bg-white">
                  <Image src={img.src} alt={img.alt} width={img.width} height={img.height} sizes="10rem" className="max-h-[85%] w-auto object-contain" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-8">
          {item.description ? (
            <p className="text-lg">{item.description}</p>
          ) : (
            <p className="text-lg">
              Locação de {item.name.toLowerCase()} em {company.address.city}. Fale com a equipe para saber modelo,
              disponibilidade e valor.
            </p>
          )}

          <Plate as="section" label="Ficha técnica" aside={company.name}>
            <h2 className="sr-only">Ficha técnica</h2>
            <dl className="mt-1">
              <PlateRow name="Equipamento">{item.name}</PlateRow>
              {item.specs.map((s) => (
                <PlateRow key={s.name} name={s.name}>
                  {s.value}
                </PlateRow>
              ))}
              {item.specs.length === 0 && <PlateRow name="Especificações">Informadas no orçamento</PlateRow>}
            </dl>
          </Plate>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <WhatsAppButton message={equipmentMessage(item.name)} tone="blue">
              Pedir orçamento deste equipamento
            </WhatsAppButton>
            <CallButton />
          </div>
          <p className="text-steel">
            Prefere escrever?{" "}
            <Link href="/contato" className="font-semibold text-blue underline underline-offset-4">
              Use o formulário de contato
            </Link>
            .
          </p>
        </div>
      </div>

      <section aria-labelledby="outros" className="border-t-2 border-ink bg-concrete">
        <div className="container-site py-14">
          <h2 id="outros" className="font-display text-4xl">
            Outros equipamentos
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
            {others.map((e) => (
              <li key={e.slug}>
                <EquipmentCard item={e} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
