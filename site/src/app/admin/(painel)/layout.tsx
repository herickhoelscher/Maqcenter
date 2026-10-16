import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireAdmin } from "@/lib/auth";
import { adminLogout } from "../_actions/session";
import { AdminNav, AdminNavLinks } from "../_ui/AdminNav";

export const metadata: Metadata = { title: { default: "Painel", template: "%s | Painel MAQCENTER" }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <aside className="on-dark bg-navy-deep text-on-dark lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-5 lg:py-6">
          <Link href="/admin" className="block">
            <span className="block text-headline-sm font-bold text-white">MAQCENTER</span>
            <span className="text-badge tracking-widest text-amber uppercase">Painel</span>
          </Link>
          <Link href="/" target="_blank" className="text-body-sm text-on-dark underline lg:mt-2 lg:inline-block">
            Ver site
          </Link>
        </div>
        <Suspense fallback={<AdminNavLinks />}>
          <AdminNav />
        </Suspense>
        <div className="hidden border-t border-white/10 px-5 py-4 lg:block">
          <Suspense>
            <CurrentUser />
          </Suspense>
        </div>
      </aside>
      <main id="conteudo" className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
        <Suspense fallback={<div className="card h-64 animate-pulse" aria-hidden />}>
          <Guard>{children}</Guard>
        </Suspense>
      </main>
    </div>
  );
}

async function Guard({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}

async function CurrentUser() {
  const user = await requireAdmin();
  return (
    <div className="space-y-2 text-body-sm">
      <p className="truncate text-white">{user.name}</p>
      <p className="truncate">{user.email}</p>
      <form action={adminLogout}>
        <button type="submit" className="btn btn-ghost-dark min-h-0 w-full py-2">
          Sair
        </button>
      </form>
    </div>
  );
}
