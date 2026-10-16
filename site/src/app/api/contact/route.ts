import { HONEYPOT_FIELD, validateContact } from "@/lib/contact";
import { db } from "@/lib/db";
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

  // The message is stored first (it shows up in the admin), then e-mailed.
  let saved: { id: string };
  try {
    saved = await db.contactMessage.create({
      data: { name: data.name, phone: data.phone, email: data.email || null, service: data.service, message: data.message },
    });
  } catch (err) {
    console.error("contact form, save:", err);
    return Response.json(
      { ok: false, error: "Não foi possível enviar agora. Fale com a gente pelo WhatsApp ou telefone." },
      { status: 500 },
    );
  }

  try {
    await sendContactEmail(data);
    await db.contactMessage.update({ where: { id: saved.id }, data: { emailSent: true } });
  } catch (err) {
    // Saved anyway; the team sees it in the admin.
    if (!(err instanceof MailNotConfiguredError)) console.error("contact form, e-mail:", err);
  }

  return Response.json({ ok: true });
}
