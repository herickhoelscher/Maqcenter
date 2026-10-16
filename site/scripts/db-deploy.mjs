// Applies prisma/migrations/*/migration.sql to the database in DATABASE_URL
// (or TURSO_DATABASE_URL), in order, skipping the ones already applied.
// Works with Turso (libsql://...) without the Turso CLI.
//   DATABASE_URL=libsql://... DATABASE_AUTH_TOKEN=... npm run db:deploy:remote
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

try {
  process.loadEnvFile(".env");
} catch {}

const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
if (!url) {
  console.error("Set DATABASE_URL (or TURSO_DATABASE_URL).");
  process.exit(1);
}

const db = createClient({ url, authToken });
await db.execute("CREATE TABLE IF NOT EXISTS _site_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)");
const applied = new Set((await db.execute("SELECT name FROM _site_migrations")).rows.map((r) => r.name));

const dir = path.join("prisma", "migrations");
const pending = readdirSync(dir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !applied.has(d.name))
  .map((d) => d.name)
  .sort();

if (pending.length === 0) console.log("Banco ja esta atualizado.");
for (const name of pending) {
  const sql = readFileSync(path.join(dir, name, "migration.sql"), "utf8");
  await db.executeMultiple(sql);
  await db.execute({ sql: "INSERT INTO _site_migrations (name, applied_at) VALUES (?, ?)", args: [name, new Date().toISOString()] });
  console.log(`Aplicada: ${name}`);
}
db.close();
