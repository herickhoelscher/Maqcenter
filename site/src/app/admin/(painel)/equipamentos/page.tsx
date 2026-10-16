import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/content";
import { db } from "@/lib/db";
import { AdminPage, Pill, Table } from "../../_ui/ui";

export const metadata = { title: "Equipamentos" };

export default async function EquipmentAdmin() {
  const items = await db.equipment.findMany({ orderBy: { sortOrder: "asc" }, include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } });
  return (
    <AdminPage
      title="Equipamentos para locação"
      description="Catálogo de locação. O cliente pede orçamento pelo WhatsApp ou pela lista de orçamento."
      actions={
        <Link href="/admin/equipamentos/novo" className="btn btn-primary">
          Novo equipamento
        </Link>
      }
    >
      <Table head={["Equipamento", "Categoria", "Diária", "Situação"]} empty={items.length === 0 ? "Nenhum equipamento." : undefined}>
        {items.map((e) => (
          <tr key={e.id} className="hover:bg-concrete-50">
            <td className="px-4 py-3">
              <Link href={`/admin/equipamentos/${e.id}`} className="flex items-center gap-3 font-semibold text-blue-accent hover:underline">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-control)] bg-concrete-100">
                  {e.images[0] && <Image src={e.images[0].src} alt="" width={40} height={40} className="size-10 object-cover" />}
                </span>
                {e.name}
              </Link>
            </td>
            <td className="px-4 py-3">{e.category}</td>
            <td className="px-4 py-3">{e.priceDailyCents != null ? formatCents(e.priceDailyCents) : <span className="text-outline">Sob consulta</span>}</td>
            <td className="px-4 py-3 space-x-1">
              {e.published ? <Pill tone="ok">Publicado</Pill> : <Pill>Oculto</Pill>}
              {e.featured && <Pill tone="info">Destaque</Pill>}
            </td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
