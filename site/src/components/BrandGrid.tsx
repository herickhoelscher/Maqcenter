import Image from "next/image";
import { getBrands } from "@/lib/content";

export function BrandGrid() {
  return (
    <ul className="grid grid-cols-2 border-t-2 border-l-2 border-ink bg-white sm:grid-cols-3 lg:grid-cols-6">
      {getBrands().map((b) => (
        <li key={b.name} className="grid h-24 place-items-center border-r-2 border-b-2 border-ink px-5 sm:h-28">
          <Image src={b.logo} alt={b.name} width={320} height={120} sizes="10rem" className="max-h-12 w-auto max-w-full object-contain" />
        </li>
      ))}
    </ul>
  );
}
