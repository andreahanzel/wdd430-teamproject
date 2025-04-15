-- CreateTable
CREATE TABLE IF NOT EXISTS "ProductImage" (
  "id" SERIAL PRIMARY KEY,
  "path" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ProductImage_path_key" ON "ProductImage"("path");
