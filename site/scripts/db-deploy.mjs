// Prepares the database before `next build`:
// 1. applies prisma/migrations/*/migration.sql in order, skipping the ones
//    already applied (also those applied locally by `prisma migrate dev`);
// 2. if the database is empty (no company row), loads the initial content
//    with the seed. Existing data is never overwritten.
// Works with Turso (libsql://...) without the Turso CLI.
//   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:deploy:remote
import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

try {
  process.loadEnvFile(".env");
} catch {}

const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
if (!url) {
  console.error("Banco nao configurado: defina DATABASE_URL ou conecte o Turso ao projeto na Vercel (TURSO_DATABASE_URL).");
  process.exit(1);
}

const db = createClient({ url, authToken });

const tableExists = async (name) =>
  (await db.execute({ sql: "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?", args: [name] })).rows.length > 0;

await db.execute("CREATE TABLE IF NOT EXISTS _site_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
const applied = new Set((await db.execute("SELECT name FROM _site_migrations")).rows.map((r) => r.name));
if (await tableExists("_prisma_migrations")) {
  const prismaApplied = await db.execute("SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL");
  for (const r of prismaApplied.rows) applied.add(r.migration_name);
}

const dir = path.join("prisma", "migrations");
const pending = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !applied.has(d.name))
  .map((d) => d.name)
  .sort();

if (pending.length === 0) console.log("Banco: tabelas em dia.");
for (const name of pending) {
  const sql = readFileSync(path.join(dir, name, "migration.sql"), "utf8");
  await db.executeMultiple(sql);
  await db.execute({ sql: "INSERT INTO _site_migrations (name, applied_at) VALUES (?, ?)", args: [name, new Date().toISOString()] });
  console.log(`Banco: migracao aplicada ${name}`);
}

const companies = Number((await db.execute("SELECT COUNT(*) AS n FROM Company")).rows[0].n);

if (companies === 0) {
  console.log("Banco vazio: carregando o conteudo inicial (seed).");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
} else {
  console.log("Banco: conteudo ja existe, seed nao executado.");
  // First staff login from ADMIN_EMAIL / ADMIN_PASSWORD, if it does not exist yet.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const found = await db.execute({ sql: "SELECT 1 FROM User WHERE email = ?", args: [email] });
    if (found.rows.length === 0) {
      const { default: bcrypt } = await import("bcryptjs");
      const { randomUUID } = await import("node:crypto");
      await db.execute({
        sql: "INSERT INTO User (id, name, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)",
        args: [randomUUID().replace(/-/g, ""), process.env.ADMIN_NAME || "Administrador", email, await bcrypt.hash(password, 12), new Date().toISOString()],
      });
      console.log(`Banco: admin criado ${email}`);
    }
  }
}
db.close();
