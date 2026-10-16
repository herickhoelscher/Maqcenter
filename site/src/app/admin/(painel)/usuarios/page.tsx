import { ActionForm, Field } from "@/components/forms/Form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { changeOwnPassword, createUser, deleteUser } from "../../_actions/ops";
import { DeleteButton } from "../../_ui/client";
import { AdminPage, Panel, Pill } from "../../_ui/ui";

export const metadata = { title: "Usuários" };

export default async function UsersAdmin() {
  const me = await requireAdmin();
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <AdminPage title="Usuários do painel" description="Cada pessoa da equipe com o próprio login. Todos têm acesso completo ao painel.">
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel title="Equipe" className="lg:col-span-7">
          <ul className="divide-y divide-concrete-100">
            {users.map((u) => (
              <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span>
                  <span className="block font-semibold text-navy">
                    {u.name} {u.id === me.id && <Pill tone="info">Você</Pill>}
                  </span>
                  <span className="text-body-sm text-outline">
                    {u.email} · último acesso {u.lastLoginAt ? u.lastLoginAt.toLocaleString("pt-BR") : "nunca"}
                  </span>
                </span>
                {u.id !== me.id && <DeleteButton action={deleteUser.bind(null, u.id)} confirmText={`Excluir o acesso de ${u.name}?`} />}
              </li>
            ))}
          </ul>
        </Panel>
        <div className="space-y-6 lg:col-span-5">
          <Panel title="Novo usuário">
            <ActionForm action={createUser} submitLabel="Criar usuário">
              <Field label="Nome" name="name" required />
              <Field label="E-mail" name="email" type="email" required autoComplete="off" />
              <Field label="Senha inicial" name="password" type="password" required autoComplete="new-password" hint="Mínimo de 10 caracteres. Peça para a pessoa trocar depois." />
            </ActionForm>
          </Panel>
          <Panel title="Trocar minha senha">
            <ActionForm action={changeOwnPassword} submitLabel="Trocar senha">
              <Field label="Senha atual" name="current" type="password" required autoComplete="current-password" />
              <Field label="Nova senha" name="password" type="password" required autoComplete="new-password" hint="Mínimo de 10 caracteres." />
            </ActionForm>
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
