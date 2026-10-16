import { db } from "@/lib/db";
import { formatDocument } from "@/lib/validators";
import { AdminPage, Table } from "../../_ui/ui";

export const metadata = { title: "Clientes" };

export default async function CustomersAdmin() {
  const customers = await db.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: { id: true, name: true, email: true, phone: true, document: true, createdAt: true, _count: { select: { orders: true } } },
  });
  return (
    <AdminPage title="Clientes" description="Pessoas com conta na loja do site.">
      <Table head={["Nome", "Contato", "CPF/CNPJ", "Pedidos", "Cadastro"]} empty={customers.length === 0 ? "Nenhum cliente cadastrado." : undefined}>
        {customers.map((c) => (
          <tr key={c.id} className="hover:bg-concrete-50">
            <td className="px-4 py-3 font-semibold text-navy">{c.name}</td>
            <td className="px-4 py-3">
              <a href={`mailto:${c.email}`} className="block text-blue-accent underline">
                {c.email}
              </a>
              <span className="text-body-sm text-outline">{c.phone}</span>
            </td>
            <td className="px-4 py-3">{formatDocument(c.document)}</td>
            <td className="px-4 py-3">{c._count.orders}</td>
            <td className="px-4 py-3 text-body-sm">{c.createdAt.toLocaleDateString("pt-BR")}</td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
