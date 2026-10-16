import Image from "next/image";
import { getBrands } from "@/lib/content";

// Grayscale at 60% by default, full color on hover (DESIGN.md).
export async function BrandGrid() {
  const brands = await getBrands();
  return (
    <ul data-reveal className="grid grid-cols-2 overflow-hidden rounded-[var(--radius-card)] border border-concrete-200 bg-white sm:grid-cols-3 lg:grid-cols-6">
      {brands.map((b) => (
        <li key={b.name} className="group grid h-24 place-items-center border-concrete-200 px-6 not-last:border-r not-last:border-b sm:border-b-0">
          <Image
            src={b.logo}
            alt={b.name}
            width={320}
            height={120}
            sizes="10rem"
            className="max-h-10 w-auto max-w-full object-contain opacity-60 grayscale transition group-hover:opacity-100 group-hover:grayscale-0"
          />
        </li>
      ))}
    </ul>
  );
}
