import { db } from "@/lib/db";
import { AdminPage } from "../../../_ui/ui";
import { EquipmentForm } from "../EquipmentForm";

export const metadata = { title: "Novo equipamento" };

export default async function NewEquipment() {
  const categories = await db.equipment.findMany({ distinct: ["category"], select: { category: true } });
  return (
    <AdminPage title="Novo equipamento" back={{ href: "/admin/equipamentos", label: "Equipamentos" }}>
      <EquipmentForm categories={categories.map((c) => c.category).filter(Boolean)} />
    </AdminPage>
  );
}
