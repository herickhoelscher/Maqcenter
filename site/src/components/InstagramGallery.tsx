import Image from "next/image";
import posts from "../../content/instagram.json";
import { company } from "@/lib/content";
import { InstagramIcon } from "./icons";

// Posts from the company Instagram. Horizontal snap strip on phones,
// grid from tablet up.
export function InstagramGallery({ limit = 10 }: { limit?: number }) {
  const ig = company.social.instagram;
  return (
    <section aria-labelledby="instagram" className="overflow-hidden bg-white py-16">
      <div className="container-site">
        <div className="flex flex-wrap items-end justify-between gap-4" data-reveal>
          <div className="space-y-2">
            <span className="badge bg-blue-accent/10 text-blue-accent">Instagram</span>
            <h2 id="instagram" className="text-headline-m text-navy md:text-headline">
              Acompanhe a {company.name}
            </h2>
            <p className="text-body-lg text-slate-text">Dicas, equipamentos e o dia a dia da oficina em {ig.handle}.</p>
          </div>
          <a href={ig.url} target="_blank" rel="noopener" className="btn btn-secondary">
            <InstagramIcon className="size-5" />
            Seguir {ig.handle}
          </a>
        </div>
        <ul className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {posts.slice(0, limit).map((p, i) => (
            <li key={p.code} className="w-[70%] shrink-0 snap-start sm:w-auto" data-reveal style={{ "--reveal-delay": `${(i % 5) * 70}ms` } as React.CSSProperties}>
              <a
                href={`https://www.instagram.com/${p.kind}/${p.code}/`}
                target="_blank"
                rel="noopener"
                className="group relative block overflow-hidden rounded-[var(--radius-card)] border border-concrete-200 shadow-level1"
              >
                <Image
                  src={p.image}
                  alt={p.alt}
                  width={540}
                  height={675}
                  sizes="(min-width: 1024px) 15rem, (min-width: 640px) 30vw, 70vw"
                  className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-end bg-gradient-to-t from-navy-deep/80 via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="flex items-center gap-2 text-btn font-bold text-white">
                    <InstagramIcon className="size-5" />
                    Ver no Instagram
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
