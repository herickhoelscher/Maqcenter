import { defineConfig } from "prisma/config";

// Prisma 7 does not load .env by itself.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env file: rely on the environment (CI, Vercel).
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
