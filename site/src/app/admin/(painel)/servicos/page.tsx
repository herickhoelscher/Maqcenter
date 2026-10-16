import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPage, Table } from "../../_ui/ui";

export const metadata = { title: "Serviços" };

export default async function ServicesAdmin() {
  const services = await db.service.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <AdminPage title="Serviços" description="Textos e fotos das páginas de cada serviço.">
      <Table head={["Serviço", "Resumo"]}>
        {services.map((s) => (
          <tr key={s.slug} className="hover:bg-concrete-50">
            <td className="px-4 py-3">
              <Link href={`/admin/servicos/${s.slug}`} className="font-semibold text-blue-accent hover:underline">
                {s.name}
              </Link>
            </td>
            <td className="px-4 py-3 text-body-sm text-slate-text">{s.summary}</td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
