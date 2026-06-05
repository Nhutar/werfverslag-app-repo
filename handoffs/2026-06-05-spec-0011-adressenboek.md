# Handoff — Spec 0011: Adressenboek (v0.11.0)

Gedeploy op 2026-06-05. CI groen.

## Wat gebouwd is

- Nieuw model `AdresboekContact` (naam, bedrijf, adres, discipline, email uniek, telefoon)
- CRUD-pagina's: `/adressenboek`, `/adressenboek/nieuw`, `/adressenboek/[id]/aanpassen`
- Nieuwe API-routes: `GET/POST /api/adressenboek`, `GET/PATCH/DELETE /api/adressenboek/[id]`
- Automatisch opslaan: nieuwe projectdeelnemers worden op e-mail opgezocht/aangemaakt in adressenboek
- Zoeken en selecteren: zoekbalk in projectformulier zoekt live in adressenboek
- Synchronisatie: PATCH op adresboekcontact updatet gekoppelde deelnemers + NOK-punten
- Bouwheer contactvelden uitgebreid op `Project`: `bouwheerBedrijf`, `bouwheerAdres`, `bouwheerEmail`, `bouwheerTelefoon`
- Link "📒 Adressenboek" op het hoofddashboard

## Nieuwe bestanden
- `app/adressenboek/page.tsx`, `nieuw/page.tsx`, `[id]/aanpassen/page.tsx`
- `app/api/adressenboek/route.ts`, `[id]/route.ts`
- `components/AdresboekFormulier.tsx`, `AdresboekVerwijderKnop.tsx`
- `prisma/migrations/20260605102710_adressenboek/migration.sql`
