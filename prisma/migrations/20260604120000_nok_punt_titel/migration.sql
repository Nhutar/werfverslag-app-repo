-- Voeg titel toe met tijdelijke DEFAULT voor bestaande rijen
ALTER TABLE "nok_punt" ADD COLUMN "titel" TEXT NOT NULL DEFAULT '';
-- Verwijder de DEFAULT (app levert voortaan altijd een titel)
ALTER TABLE "nok_punt" ALTER COLUMN "titel" DROP DEFAULT;
-- Maak omschrijving optioneel
ALTER TABLE "nok_punt" ALTER COLUMN "omschrijving" DROP NOT NULL;
