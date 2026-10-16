import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteEquipment } from "../../../_actions/catalog";
import { DeleteButton } from "../../../_ui/client";
import { AdminPage } from "../../../_ui/ui";
import { EquipmentForm } from "../EquipmentForm";

export const metadata = { title: "Editar equipamento" };

export default async function EditEquipment({ params, searchParams }: PageProps<"/admin/equipamentos/[id]">) {
  const { id } = await params;
  const created = (await searchParams).criado === "1";
  const [item, categories] = await Promise.all([
    db.equipment.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } }),
    db.equipment.findMany({ distinct: ["category"], select: { category: true } }),
  ]);
  if (!item) notFound();
  return (
    <AdminPage
      title={item.name}
      description={created ? "Equipamento criado." : undefined}
      back={{ href: "/admin/equipamentos", label: "Equipamentos" }}
      actions={
        <>
          <Link href={`/locacoes/${item.slug}`} target="_blank" className="btn btn-muted">
            Ver no site
          </Link>
          <DeleteButton action={deleteEquipment.bind(null, item.id)} label="Excluir" className="btn btn-muted text-crimson" />
        </>
      }
    >
      <EquipmentForm item={item} categories={categories.map((c) => c.category).filter(Boolean)} />
    </AdminPage>
  );
}
