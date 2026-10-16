import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

// One client per process (dev hot reload would otherwise open many).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // TURSO_* is what the Turso integration on Vercel creates.
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || undefined;
  const adapter = new PrismaLibSql({ url, authToken });
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
