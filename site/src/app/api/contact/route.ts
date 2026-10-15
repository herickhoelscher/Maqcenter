import { HONEYPOT_FIELD, validateContact } from "@/lib/contact";
import { MailNotConfiguredError, sendContactEmail } from "@/lib/mail";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Requisição inválida." }, { status: 400 });
  }

  // Bots fill every field. Pretend success so they do not retry.
  if (String(body[HONEYPOT_FIELD] ?? "").trim() !== "") {
    return Response.json({ ok: true });
  }

  const { data, errors } = validateContact(body);
  if (Object.keys(errors).length > 0) {
    return Response.json({ ok: false, errors }, { status: 422 });
  }

  try {
    await sendContactEmail(data);
  } catch (err) {
    console.error("contact form:", err);
    const status = err instanceof MailNotConfiguredError ? 503 : 502;
    return Response.json(
      { ok: false, error: "Não foi possível enviar agora. Fale com a gente pelo WhatsApp ou telefone." },
      { status },
    );
  }

  return Response.json({ ok: true });
}
