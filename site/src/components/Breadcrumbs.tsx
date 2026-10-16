import Link from "next/link";
import { siteUrl } from "@/lib/seo";
import { ChevronRightIcon, HomeIcon } from "./icons";
import { JsonLd } from "./JsonLd";

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ href: "/", label: "Início" }, ...items];
  return (
    <>
      <nav aria-label="Você está em">
        <ol className="flex flex-wrap items-center gap-2 text-body-sm text-outline">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {i > 0 && <ChevronRightIcon className="size-3 text-outline-variant" />}
                {last ? (
                  <span aria-current="page" className="font-semibold text-navy">
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className="flex items-center gap-1 hover:text-blue-accent">
                    {i === 0 && <HomeIcon className="size-3.5" />}
                    {c.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `${siteUrl}${c.href === "/" ? "" : c.href}`,
          })),
        }}
      />
    </>
  );
}
