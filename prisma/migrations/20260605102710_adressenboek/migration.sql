-- AlterTable
ALTER TABLE "project" ADD COLUMN     "bouwheer_adres" TEXT,
ADD COLUMN     "bouwheer_bedrijf" TEXT,
ADD COLUMN     "bouwheer_email" TEXT,
ADD COLUMN     "bouwheer_telefoon" TEXT;

-- AlterTable
ALTER TABLE "project_deelnemer" ADD COLUMN     "adresboek_contact_id" TEXT;

-- CreateTable
CREATE TABLE "adresboek_contact" (
    "id" TEXT NOT NULL,
    "naam" TEXT NOT NULL,
    "bedrijf" TEXT,
    "adres" TEXT,
    "discipline" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefoon" TEXT,
    "aangemaakt_op" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "adresboek_contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "adresboek_contact_email_key" ON "adresboek_contact"("email");

-- AddForeignKey
ALTER TABLE "project_deelnemer" ADD CONSTRAINT "project_deelnemer_adresboek_contact_id_fkey" FOREIGN KEY ("adresboek_contact_id") REFERENCES "adresboek_contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;
