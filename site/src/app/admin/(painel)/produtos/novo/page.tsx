import { AdminPage } from "../../../_ui/ui";
import { ProductForm } from "../ProductForm";

export const metadata = { title: "Novo produto" };

export default function NewProduct() {
  return (
    <AdminPage title="Novo produto" back={{ href: "/admin/produtos", label: "Produtos" }}>
      <ProductForm />
    </AdminPage>
  );
}
