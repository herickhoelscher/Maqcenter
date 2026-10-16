import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { getCustomer, safeNext } from "@/lib/auth";
import { pageMetadata } from "@/lib/seo";
import { SignUpForm } from "../AccountForms";

export const metadata = pageMetadata({ title: "Criar conta", description: "Crie sua conta na MAQCENTER.", path: "/conta/cadastro", noindex: true });

export default function SignUpPage({ searchParams }: PageProps<"/conta/cadastro">) {
  return (
    <>
      <PageHeader title="Criar conta" lead="Com a conta você compra pelo site e acompanha seus pedidos." crumbs={[{ href: "/conta/cadastro", label: "Criar conta" }]} />
      <div className="container-site py-10 lg:py-16">
        <div className="card mx-auto max-w-2xl p-6 md:p-8">
          <Suspense fallback={<div className="h-96 animate-pulse rounded bg-concrete-100" aria-hidden />}>
            <SignUp searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </>
  );
}

async function SignUp({ searchParams }: { searchParams: PageProps<"/conta/cadastro">["searchParams"] }) {
  const next = safeNext((await searchParams).next as string | undefined, "/conta");
  if (await getCustomer()) redirect(next);
  return <SignUpForm next={next} />;
}
