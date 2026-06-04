/*
  Warnings:

  - You are about to drop the column `nok_punt_id` on the `magic_link_token` table. All the data in the column will be lost.
  - Added the required column `verantwoordelijke_email` to the `magic_link_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verantwoordelijke_naam` to the `magic_link_token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `werfverslag_id` to the `magic_link_token` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "magic_link_token" DROP CONSTRAINT "magic_link_token_nok_punt_id_fkey";

-- AlterTable
ALTER TABLE "magic_link_token" DROP COLUMN "nok_punt_id",
ADD COLUMN     "verantwoordelijke_email" TEXT NOT NULL,
ADD COLUMN     "verantwoordelijke_naam" TEXT NOT NULL,
ADD COLUMN     "werfverslag_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "magic_link_token" ADD CONSTRAINT "magic_link_token_werfverslag_id_fkey" FOREIGN KEY ("werfverslag_id") REFERENCES "werfverslag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
