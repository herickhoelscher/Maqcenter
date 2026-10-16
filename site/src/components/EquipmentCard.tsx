import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Equipment } from "@/lib/content";
import { equipmentMessage, whatsappUrl } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./icons";
import { AddToQuoteButton } from "./quote/QuoteControls";

export function EquipmentCard({ item, headingLevel = "h3" }: { item: Equipment; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const photo = item.images[0];
  const summary = item.description?.[0];
  return (
    <article className="card group relative flex h-full flex-col justify-between overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-concrete-300 hover:shadow-level2">
      <div>
        <div className="relative flex h-52 items-center justify-center overflow-hidden bg-concrete-50">
          <span className="badge absolute top-3 left-3 z-10 bg-navy text-white">Locação</span>
          {item.availability && (
            <span className="badge absolute top-3 right-3 z-10 bg-success-strong text-white">
              <span aria-hidden className="size-1.5 rounded-full bg-white" />
              {item.availability}
            </span>
          )}
          {photo ? (
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(min-width: 1280px) 18rem, (min-width: 768px) 45vw, 92vw"
              className={
                photo.fit === "cover"
                  ? "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  : "h-[78%] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              }
            />
          ) : (
            <span className="px-6 text-center text-headline-sm font-bold text-outline" aria-hidden>
              Foto em breve
            </span>
          )}
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-spec tracking-wider text-outline uppercase">{item.category}</span>
            {item.brand && <span className="text-badge text-blue-accent uppercase">{item.brand}</span>}
          </div>
          <Heading className="text-title leading-snug text-navy group-hover:text-blue-accent">
            <Link href={`/locacoes/${item.slug}`} className="after:absolute after:inset-0">
              {item.name}
            </Link>
          </Heading>
          {summary && <p className="line-clamp-3 text-body-sm text-slate-text">{summary}</p>}
          {item.specs.length > 0 && (
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {item.specs.slice(0, 3).map((s) => (
                <li key={s.name} className="chip">
                  {s.name}: {s.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="relative z-10 space-y-3 p-5 pt-0">
        <div className="flex items-baseline justify-between border-t border-concrete-100 pt-3">
          {item.priceDaily ? (
            <div>
              <span className="text-body-sm text-outline">Diária a partir de</span>
              <div className="flex items-baseline gap-1">
                <span className="text-title font-extrabold text-navy">{formatPrice(item.priceDaily)}</span>
                <span className="text-body-sm text-slate-text">/dia</span>
              </div>
            </div>
          ) : (
            <span className="text-body-sm text-outline">Valor sob consulta</span>
          )}
        </div>
        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <a href={whatsappUrl(equipmentMessage(item.name))} target="_blank" rel="noopener" className="btn btn-primary px-2">
            <WhatsAppIcon className="size-4" />
            Cotar
            <span className="sr-only">{item.name} pelo WhatsApp</span>
          </a>
          <Link href={`/locacoes/${item.slug}`} className="btn btn-muted px-2">
            Detalhes
            <span className="sr-only">de {item.name}</span>
          </Link>
          <AddToQuoteButton slug={item.slug} name={item.name} kind="locacao" />
        </div>
      </div>
    </article>
  );
}
