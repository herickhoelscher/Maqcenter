"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Início" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos à venda" },
  { href: "/admin/equipamentos", label: "Equipamentos (locação)" },
  { href: "/admin/servicos", label: "Serviços" },
  { href: "/admin/empresa", label: "Dados da empresa" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/depoimentos", label: "Depoimentos" },
  { href: "/admin/mensagens", label: "Mensagens" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/usuarios", label: "Usuários" },
];

export function AdminNav() {
  return <AdminNavLinks pathname={usePathname()} />;
}

/** Without a pathname (Suspense fallback) nothing is highlighted. */
export function AdminNavLinks({ pathname }: { pathname?: string }) {
  const active = (href: string) => (pathname ? (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href)) : false);
  return (
    <nav aria-label="Painel">
      <ul className="flex gap-1 overflow-x-auto px-3 pb-3 [scrollbar-width:none] lg:flex-col lg:px-3 lg:pb-6">
        {items.map((i) => (
          <li key={i.href} className="shrink-0">
            <Link
              href={i.href}
              aria-current={active(i.href) ? "page" : undefined}
              className={`block rounded-[var(--radius-control)] px-3 py-2 text-body font-semibold whitespace-nowrap transition-colors ${
                active(i.href) ? "bg-amber text-charcoal" : "text-on-dark hover:bg-white/10 hover:text-white"
              }`}
            >
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
