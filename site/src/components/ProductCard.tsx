import Image from "next/image";
import type { Product } from "@/lib/content";
import { productMessage, whatsappUrl } from "@/lib/whatsapp";
import { VerifiedIcon, WhatsAppIcon, WrenchIcon } from "./icons";
import { AddToQuoteButton } from "./quote/QuoteControls";

export function ProductCard({ item }: { item: Product }) {
  const summary = item.description?.[0];
  return (
    <article className="card group relative flex h-full flex-col justify-between overflow-hidden transition hover:-translate-y-1 hover:border-concrete-300 hover:shadow-level2">
      <div>
        <div className="relative flex h-44 items-center justify-center overflow-hidden bg-concrete-50">
          <span className="badge absolute top-3 left-3 z-10 bg-blue-accent text-white">Venda</span>
          {item.image ? (
            <Image
              src={item.image.src}
              alt={item.image.alt}
              width={item.image.width}
              height={item.image.height}
              sizes="(min-width: 1280px) 18rem, (min-width: 768px) 45vw, 92vw"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <span aria-hidden className="grid size-16 place-items-center rounded-full bg-white text-navy shadow-level1 transition-transform duration-300 group-hover:scale-110">
              {item.group === "Máquinas" ? <VerifiedIcon className="size-8" /> : <WrenchIcon className="size-8" />}
            </span>
          )}
        </div>
        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-spec tracking-wider text-outline uppercase">{item.group}</span>
            {item.brand && <span className="text-badge text-blue-accent uppercase">{item.brand}</span>}
          </div>
          <h3 className="text-title leading-snug text-navy">{item.name}</h3>
          {summary ? (
            <p className="line-clamp-3 text-body-sm text-slate-text">{summary}</p>
          ) : (
            <p className="text-body-sm text-slate-text">Consulte modelos, marcas e disponibilidade.</p>
          )}
        </div>
      </div>
      <div className="space-y-3 p-5 pt-0">
        <p className="border-t border-concrete-100 pt-3 text-body-sm text-outline">Valor sob consulta</p>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <a href={whatsappUrl(productMessage(item.name))} target="_blank" rel="noopener" className="btn btn-primary px-2">
            <WhatsAppIcon className="size-4" />
            Cotar
            <span className="sr-only">{item.name} pelo WhatsApp</span>
          </a>
          <AddToQuoteButton slug={item.slug} name={item.name} kind="venda" />
        </div>
      </div>
    </article>
  );
}
