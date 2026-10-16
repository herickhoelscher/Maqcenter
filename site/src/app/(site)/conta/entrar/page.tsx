import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { getCustomer, safeNext } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import { SignInForm } from "../AccountForms";

export const metadata = pageMetadata({ title: "Entrar", description: "Entre na sua conta MAQCENTER.", path: "/conta/entrar", noindex: true });

export default function SignInPage({ searchParams }: PageProps<"/conta/entrar">) {
  return (
    <>
      <PageHeader title="Entrar na sua conta" lead="Acompanhe seus pedidos e compre mais rápido." crumbs={[{ href: "/conta/entrar", label: "Entrar" }]} />
      <div className="container-site py-10 lg:py-16">
        <div className="card mx-auto max-w-lg p-6 md:p-8">
          <Suspense fallback={<div className="h-64 animate-pulse rounded bg-concrete-100" aria-hidden />}>
            <SignIn searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

async function SignIn({ searchParams }: { searchParams: PageProps<"/conta/entrar">["searchParams"] }) {
  const next = safeNext((await searchParams).next as string | undefined, "/conta");
  if (await getCustomer()) redirect(next);
  return <SignInForm next={next} />;
}
