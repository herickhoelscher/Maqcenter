import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { deleteProduct } from "../../../_actions/catalog";
import { DeleteButton } from "../../../_ui/client";
import { AdminPage } from "../../../_ui/ui";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Editar produto" };

export default async function EditProduct({ params, searchParams }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  const created = (await searchParams).criado === "1";
  const product = await db.product.findUnique({ where: { id }, include: { images: { orderBy: { sortOrder: "asc" } } } });
  if (!product) notFound();
  return (
    <AdminPage
      title={product.name}
      description={created ? "Produto criado. Agora você pode adicionar mais fotos." : undefined}
      back={{ href: "/admin/produtos", label: "Produtos" }}
      actions={<DeleteButton action={deleteProduct.bind(null, product.id)} label="Excluir produto" className="btn btn-muted text-crimson" />}
    >
      <ProductForm product={product} />
    </AdminPage>
  );
}
