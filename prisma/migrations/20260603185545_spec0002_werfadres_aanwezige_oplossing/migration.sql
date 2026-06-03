/*
  Warnings:

  - Added the required column `werfadres` to the `werfverslag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "nok_punt" ADD COLUMN     "oplossing_foto_url" TEXT,
ADD COLUMN     "oplossing_omschrijving" TEXT;

-- AlterTable
ALTER TABLE "werfverslag" ADD COLUMN     "werfadres" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "aanwezige" (
    "id" TEXT NOT NULL,
    "werfverslag_id" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "aanwezige_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "aanwezige" ADD CONSTRAINT "aanwezige_werfverslag_id_fkey" FOREIGN KEY ("werfverslag_id") REFERENCES "werfverslag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
