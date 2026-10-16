-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Equipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "brand" TEXT,
    "availability" TEXT,
    "priceDailyCents" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "specs" TEXT NOT NULL DEFAULT '[]',
    "previousSlugs" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Equipment" ("createdAt", "description", "featured", "id", "name", "previousSlugs", "published", "slug", "sortOrder", "specs", "updatedAt") SELECT "createdAt", "description", "featured", "id", "name", "previousSlugs", "published", "slug", "sortOrder", "specs", "updatedAt" FROM "Equipment";
DROP TABLE "Equipment";
ALTER TABLE "new_Equipment" RENAME TO "Equipment";
CREATE UNIQUE INDEX "Equipment_slug_key" ON "Equipment"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
