-- CreateTable
CREATE TABLE "opmerking" (
    "id" TEXT NOT NULL,
    "project_id" TEXT,
    "werfverslag_id" TEXT,
    "nok_punt_id" TEXT,
    "auteur_naam" TEXT NOT NULL,
    "auteur_rol" TEXT NOT NULL,
    "tekst" TEXT NOT NULL,
    "foto_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "aangemaakt_op" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "opmerking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "opmerking" ADD CONSTRAINT "opmerking_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opmerking" ADD CONSTRAINT "opmerking_werfverslag_id_fkey" FOREIGN KEY ("werfverslag_id") REFERENCES "werfverslag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opmerking" ADD CONSTRAINT "opmerking_nok_punt_id_fkey" FOREIGN KEY ("nok_punt_id") REFERENCES "nok_punt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
