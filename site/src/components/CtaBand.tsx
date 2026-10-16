import Link from "next/link";
import { getCompany } from "@/lib/content";
import { Backdrop } from "./Backdrop";
import { ListIcon, PhoneIcon } from "./icons";

// Navy banner that closes pages, as in the catalog design.
export async function CtaBand({
  badge = "Orçamento sem compromisso",
  title,
  text,
}: {
  badge?: string;
  title: string;
  text?: string;
}) {
  const company = await getCompany();
  return (
    <section className="on-dark relative overflow-hidden bg-navy-deep py-14 text-white md:py-20">
      <Backdrop src="/images/fundos/cta-compactador.webp" position="center 45%" overlay="bg-gradient-to-r from-navy-deep via-navy-deep/92 to-navy-deep/75" />
      <div className="container-site relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
        <div className="max-w-2xl space-y-3" data-reveal>
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge bg-amber text-charcoal">{badge}</span>
            <span className="text-spec text-on-dark">
              {company.address.city} - {company.address.state}
            </span>
          </div>
          <h2 className="text-headline-m tracking-tight md:text-headline">{title}</h2>
          {text && <p className="text-body-lg text-on-dark">{text}</p>}
        </div>
        <div className="flex w-full flex-col items-center gap-4 sm:flex-row lg:w-auto">
          <Link href="/orcamento" className="btn btn-primary w-full px-8 py-4 sm:w-auto">
            <ListIcon className="size-5" />
            Montar orçamento
          </Link>
          <a href={`tel:${company.phone.e164}`} className="btn btn-ghost-dark w-full px-6 py-4 sm:w-auto">
            <PhoneIcon className="size-5" />
            {company.phone.display}
          </a>
        </div>
      </div>
    </section>
  );
}
