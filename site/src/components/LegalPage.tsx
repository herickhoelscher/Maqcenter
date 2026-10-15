import { company, type LegalPage as LegalContent } from "@/lib/content";
import { PageHeader } from "./PageHeader";

export function LegalPage({ content, path }: { content: LegalContent; path: string }) {
  const fill = (text: string) => text.replaceAll("{email}", company.email);
  return (
    <>
      <PageHeader title={content.title} crumbs={[{ href: path, label: content.title }]} />
      <article className="container-site max-w-3xl py-12 md:py-16">
        {content.sections.length === 0 ? (
          <p className="text-lg">
            Este texto está em revisão. Para dúvidas, escreva para{" "}
            <a href={`mailto:${company.email}`} className="font-semibold text-blue underline underline-offset-4">
              {company.email}
            </a>
            .
          </p>
        ) : (
          content.sections.map((s) => (
            <section key={s.heading} className="mb-10">
              <h2 className="font-display text-3xl">{s.heading}</h2>
              {s.paragraphs.map((p) => (
                <p key={p} className="mt-3 text-lg">
                  {fill(p)}
                </p>
              ))}
            </section>
          ))
        )}
      </article>
    </>
  );
}
