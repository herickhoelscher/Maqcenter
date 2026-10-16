import { company, type LegalPage as LegalContent } from "@/lib/content";
import { PageHeader } from "./PageHeader";

export function LegalPage({ content, path }: { content: LegalContent; path: string }) {
  const fill = (text: string) => text.replaceAll("{email}", company.email);
  return (
    <>
      <PageHeader title={content.title} crumbs={[{ href: path, label: content.title }]} />
      <div className="container-site py-10 lg:py-16">
        <article className="card max-w-3xl space-y-8 p-6 md:p-10">
          {content.sections.length === 0 ? (
            <p className="text-body-lg text-slate-text">
              Este texto está em revisão. Para dúvidas, escreva para{" "}
              <a href={`mailto:${company.email}`} className="font-semibold text-blue-accent underline">
                {company.email}
              </a>
              .
            </p>
          ) : (
            content.sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-headline-sm text-navy">{s.heading}</h2>
                {s.paragraphs.map((p) => (
                  <p key={p} className="mt-3 text-body-lg text-slate-text">
                    {fill(p)}
                  </p>
                ))}
              </section>
            ))
          )}
        </article>
      </div>
    </>
  );
}
