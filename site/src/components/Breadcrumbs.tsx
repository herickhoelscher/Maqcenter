import Link from "next/link";
import { siteUrl } from "@/lib/seo";
import { JsonLd } from "./JsonLd";

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ href: "/", label: "Início" }, ...items];
  return (
    <>
      <nav aria-label="Você está em">
        <ol className="label-mono flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-soft">
          {all.map((c, i) => {
            const last = i === all.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-white">
                    {c.label}
                  </span>
                ) : (
                  <>
                    <Link href={c.href} className="underline-offset-4 hover:text-white hover:underline">
                      {c.label}
                    </Link>
                    <span aria-hidden>/</span>
                  </>
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
