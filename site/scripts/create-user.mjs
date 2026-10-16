// Creates a staff login for the admin panel.
//   npm run user:create -- "Nome" email@exemplo.com [senha]
// Without a password, a strong one is generated and printed once.
import { randomBytes, randomUUID } from "node:crypto";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";

try {
  process.loadEnvFile(".env");
} catch {}

const [name, emailArg, passwordArg] = process.argv.slice(2);
const email = (emailArg ?? "").trim().toLowerCase();
if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Uso: npm run user:create -- "Nome" email@exemplo.com [senha]');
  process.exit(1);
}
const password = passwordArg || randomBytes(9).toString("base64url");
if (password.length < 10) {
  console.error("A senha precisa ter pelo menos 10 caracteres.");
  process.exit(1);
}

const db = createClient({
  url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL,
  authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined,
});
const exists = await db.execute({ sql: "SELECT id FROM User WHERE email = ?", args: [email] });
if (exists.rows.length) {
  console.error(`Ja existe um usuario com ${email}.`);
  process.exit(1);
}
await db.execute({
  sql: "INSERT INTO User (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)",
  args: [randomUUID().replace(/-/g, ""), name, email, await bcrypt.hash(password, 12), new Date().toISOString()],
});
console.log(`Usuario criado: ${name} <${email}>`);
if (!passwordArg) console.log(`Senha inicial: ${password}`);
db.close();
