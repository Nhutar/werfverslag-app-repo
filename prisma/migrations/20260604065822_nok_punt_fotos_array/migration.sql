/*
  Warnings:

  - You are about to drop the column `foto_url` on the `nok_punt` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "nok_punt" DROP COLUMN "foto_url",
ADD COLUMN     "foto_urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
