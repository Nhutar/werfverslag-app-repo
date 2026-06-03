-- AlterTable: voeg verslaggever toe met tijdelijke default voor bestaande rijen
ALTER TABLE "werfverslag" ADD COLUMN "verslaggever" TEXT NOT NULL DEFAULT 'Onbekend';

-- Verwijder de default zodat nieuwe rijen verplicht een waarde meegeven
ALTER TABLE "werfverslag" ALTER COLUMN "verslaggever" DROP DEFAULT;
