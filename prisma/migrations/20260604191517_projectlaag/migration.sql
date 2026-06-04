/*
  Warnings:

  - You are about to drop the column `naam` on the `werfverslag` table. All the data in the column will be lost.
  - You are about to drop the column `werfadres` on the `werfverslag` table. All the data in the column will be lost.
  - You are about to drop the `aanwezige` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `project_id` to the `werfverslag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "aanwezige" DROP CONSTRAINT "aanwezige_werfverslag_id_fkey";

-- AlterTable
ALTER TABLE "werfverslag" DROP COLUMN "naam",
DROP COLUMN "werfadres",
ADD COLUMN     "project_id" TEXT NOT NULL;

-- DropTable
DROP TABLE "aanwezige";

-- CreateTable
CREATE TABLE "project" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "werfadres" TEXT NOT NULL,
    "bouwheer" TEXT,
    "beschrijving" TEXT,
    "aangemaakt_op" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_deelnemer" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "discipline" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "project_deelnemer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "werfverslag_aanwezige" (
    "id" TEXT NOT NULL,
    "werfverslag_id" TEXT NOT NULL,
    "project_deelnemer_id" TEXT NOT NULL,

    CONSTRAINT "werfverslag_aanwezige_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_deelnemer" ADD CONSTRAINT "project_deelnemer_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "werfverslag" ADD CONSTRAINT "werfverslag_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "werfverslag_aanwezige" ADD CONSTRAINT "werfverslag_aanwezige_werfverslag_id_fkey" FOREIGN KEY ("werfverslag_id") REFERENCES "werfverslag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "werfverslag_aanwezige" ADD CONSTRAINT "werfverslag_aanwezige_project_deelnemer_id_fkey" FOREIGN KEY ("project_deelnemer_id") REFERENCES "project_deelnemer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
