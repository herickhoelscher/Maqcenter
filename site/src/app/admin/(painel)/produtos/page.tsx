import Image from "next/image";
import Link from "next/link";
import { formatCents } from "@/lib/content";
import { db } from "@/lib/db";
import { AdminPage, Pill, Table } from "../../_ui/ui";

export const metadata = { title: "Produtos à venda" };

export default async function ProductsAdmin() {
  const products = await db.product.findMany({ orderBy: [{ group: "asc" }, { sortOrder: "asc" }], include: { images: { take: 1, orderBy: { sortOrder: "asc" } } } });
  return (
    <AdminPage
      title="Produtos à venda"
      description="Com preço e estoque, o produto pode ser comprado pelo site. Sem preço, aparece como 'sob consulta' com botão de orçamento."
      actions={
        <Link href="/admin/produtos/novo" className="btn btn-primary">
          Novo produto
        </Link>
      }
    >
      <Table head={["Produto", "Grupo", "Preço", "Estoque", "Situação"]} empty={products.length === 0 ? "Nenhum produto." : undefined}>
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-concrete-50">
            <td className="px-4 py-3">
              <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3 font-semibold text-blue-accent hover:underline">
                <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-[var(--radius-control)] bg-concrete-100">
                  {p.images[0] && <Image src={p.images[0].src} alt="" width={40} height={40} className="size-10 object-cover" />}
                </span>
                {p.name}
              </Link>
            </td>
            <td className="px-4 py-3">{p.group}</td>
            <td className="px-4 py-3">{p.priceCents != null ? formatCents(p.priceCents) : <span className="text-outline">Sob consulta</span>}</td>
            <td className="px-4 py-3">{p.priceCents != null ? p.stock : "-"}</td>
            <td className="px-4 py-3">
              {!p.active ? <Pill>Oculto</Pill> : p.priceCents != null ? (p.stock > 0 ? <Pill tone="ok">À venda</Pill> : <Pill tone="bad">Sem estoque</Pill>) : <Pill tone="info">Orçamento</Pill>}
            </td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
