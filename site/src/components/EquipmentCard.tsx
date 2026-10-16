import Image from "next/image";
import Link from "next/link";
import type { Equipment } from "@/lib/content";
import { ArrowIcon } from "./icons";
import { Plate } from "./Plate";

export function EquipmentCard({ item, headingLevel = "h3" }: { item: Equipment; headingLevel?: "h2" | "h3" }) {
  const Heading = headingLevel;
  const photo = item.images[0];
  return (
    <Plate as="article" label="Locação" className="group h-full">
      <div className="relative mt-1.5 grid aspect-[4/3] place-items-center overflow-hidden rounded-sm bg-white">
        {photo ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(min-width: 1024px) 16rem, 45vw"
            className={photo.fit === "cover" ? "h-full w-full object-cover" : "h-[85%] w-auto object-contain"}
          />
        ) : (
          // No photo yet: the name stamped large, like an unlabelled plate.
          <span aria-hidden className="font-display px-3 text-center text-3xl text-stamp sm:text-4xl">
            {item.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 px-2 pt-3 pb-3">
        <Heading className="font-display text-2xl sm:text-[1.75rem]">
          <Link href={`/locacoes/${item.slug}`} className="after:absolute after:inset-0 hover:text-blue">
            {item.name}
          </Link>
        </Heading>
        <span className="label-mono inline-flex items-center gap-2 text-blue">
          Ver detalhes
          <ArrowIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Plate>
  );
}
