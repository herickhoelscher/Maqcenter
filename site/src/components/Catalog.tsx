"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useId, useMemo, useState, type ReactNode } from "react";
import type { Equipment } from "@/lib/content";
import { CloseIcon, SearchIcon, TuneIcon } from "./icons";

type Sort = "order" | "name" | "category";

const normalize = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Search, category filter and sort for the rental catalog. Cards are
// rendered on the server and passed in by slug, so this only decides
// which ones show and in what order.
export function Catalog({
  items,
  cards,
  categories,
  aside,
}: {
  items: Equipment[];
  cards: Record<string, ReactNode>;
  categories: { name: string; count: number }[];
  aside: ReactNode;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("categoria") ?? "");
  const [sort, setSort] = useState<Sort>("order");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const id = useId();

  const visible = useMemo(() => {
    const q = normalize(query.trim());
    const list = items.filter(
      (e) =>
        (!category || e.category === category) &&
        (!q || normalize([e.name, e.category, e.brand ?? "", ...(e.description ?? [])].join(" ")).includes(q)),
    );
    const by: Record<Sort, (a: Equipment, b: Equipment) => number> = {
      order: (a, b) => a.order - b.order,
      name: (a, b) => a.name.localeCompare(b.name, "pt-BR"),
      category: (a, b) => a.category.localeCompare(b.category, "pt-BR") || a.name.localeCompare(b.name, "pt-BR"),
    };
    return list.sort(by[sort]);
  }, [items, query, category, sort]);

  // Keep the URL shareable without adding history entries.
  const sync = (q: string, c: string) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (c) sp.set("categoria", c);
    router.replace(sp.size ? `/locacoes?${sp}` : "/locacoes", { scroll: false });
  };

  const clear = () => {
    setQuery("");
    setCategory("");
    sync("", "");
  };

  const active = [category && { label: `Categoria: ${category}`, clear: () => (setCategory(""), sync(query, "")) }, query && { label: `Busca: ${query}`, clear: () => (setQuery(""), sync("", category)) }].filter(Boolean) as {
    label: string;
    clear: () => void;
  }[];

  return (
    <>
      <div className="mt-6 flex flex-col items-stretch justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <span className="rounded-[var(--radius-control)] bg-concrete-100 px-3 py-1.5 text-spec font-bold text-navy" aria-live="polite">
            {visible.length} {visible.length === 1 ? "equipamento encontrado" : "equipamentos encontrados"}
          </span>
          <button type="button" onClick={() => setFiltersOpen((v) => !v)} aria-expanded={filtersOpen} aria-controls={`${id}-filters`} className="btn btn-muted lg:hidden">
            <TuneIcon className="size-5" />
            Filtros
          </button>
        </div>
        <div className="flex max-w-xl flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-outline" />
            <label htmlFor={`${id}-q`} className="sr-only">
              Pesquisar equipamentos
            </label>
            <input
              id={`${id}-q`}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => sync(query, category)}
              placeholder="Pesquisar betoneira, rompedor, compactador..."
              className="field bg-concrete-50 pl-10 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-2 sm:min-w-[13rem]">
            <label htmlFor={`${id}-sort`} className="text-body-sm whitespace-nowrap text-outline">
              Ordenar:
            </label>
            <select id={`${id}-sort`} value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field cursor-pointer bg-concrete-50 py-2 text-navy">
              <option value="order">Destaques</option>
              <option value="name">Nome (A-Z)</option>
              <option value="category">Por categoria</option>
            </select>
          </div>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <aside id={`${id}-filters`} className={`${filtersOpen ? "block" : "hidden"} space-y-6 lg:col-span-3 lg:block`}>
          <div className="card space-y-6 p-5">
            <div className="flex items-center justify-between border-b border-concrete-100 pb-4">
              <h2 className="flex items-center gap-2 text-title text-navy">
                <TuneIcon className="size-5 text-blue-accent" />
                Filtros
              </h2>
              <button type="button" onClick={clear} className="text-body-sm text-outline underline hover:text-crimson">
                Limpar
              </button>
            </div>
            <fieldset className="space-y-3">
              <legend className="mb-3 text-badge tracking-wider text-outline uppercase">Categorias</legend>
              <div className="space-y-1.5 text-body-sm text-slate-text">
                {[{ name: "", count: items.length }, ...categories].map((c) => {
                  const checked = category === c.name;
                  return (
                    <label key={c.name || "all"} className="group flex cursor-pointer items-center justify-between rounded-[var(--radius-control)] p-2 hover:bg-concrete-50">
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`${id}-category`}
                          checked={checked}
                          onChange={() => {
                            setCategory(c.name);
                            sync(query, c.name);
                          }}
                          className="accent-blue-accent"
                        />
                        <span className={checked ? "font-semibold text-navy" : "group-hover:text-navy"}>{c.name || "Todas as categorias"}</span>
                      </span>
                      <span className="rounded-full bg-concrete-100 px-2 py-0.5 text-[11px] font-bold text-outline">{c.count}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
          {aside}
        </aside>

        <section aria-label="Equipamentos" className="space-y-6 lg:col-span-9">
          {active.length > 0 && (
            <div className="card flex flex-wrap items-center gap-2 p-3.5">
              <span className="text-body-sm text-outline">Filtros ativos:</span>
              {active.map((f) => (
                <span key={f.label} className="inline-flex items-center gap-1 rounded-[var(--radius-control)] bg-concrete-100 px-2.5 py-1 text-spec text-navy">
                  {f.label}
                  <button type="button" onClick={f.clear} className="ml-1 hover:text-crimson" aria-label={`Remover ${f.label}`}>
                    <CloseIcon className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {visible.length > 0 ? (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((e, i) => (
                <li key={e.slug} data-reveal style={{ "--reveal-delay": `${(i % 3) * 80}ms` } as React.CSSProperties}>
                  {cards[e.slug]}
                </li>
              ))}
            </ul>
          ) : (
            <div className="card p-8 text-center">
              <p className="text-title text-navy">Nenhum equipamento encontrado.</p>
              <p className="mt-2 text-body text-slate-text">Tente outro termo, limpe os filtros ou pergunte pelo WhatsApp.</p>
              <button type="button" onClick={clear} className="btn btn-secondary mt-5">
                Limpar filtros
              </button>
            </div>
          )}
          <div className="card flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
            <span className="text-body-sm text-slate-text">
              Mostrando <strong>{visible.length} de {items.length}</strong> equipamentos para locação em Cascavel
            </span>
          </div>
        </section>
      </div>
    </>
  );
}
