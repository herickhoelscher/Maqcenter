import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-navy-deep px-4 py-12">
      <div className="card w-full max-w-sm space-y-6 p-7">
        <div className="space-y-1">
          <span className="badge bg-navy text-amber">Painel</span>
          <h1 className="text-headline-m text-navy">MAQCENTER</h1>
          <p className="text-body text-slate-text">Entre com o seu usuário da equipe.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
