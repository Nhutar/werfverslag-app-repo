# Handoff — Spec 0012: Tijdlijn/Gantt (v0.12.0)

Gedeploy op 2026-06-05. CI groen.

## Wat gebouwd is

- `TijdlijnSVG`: SVG-component met hoofdlijn, werfverslagen als knooppunten, NOK-blokjes op deadline-datum, haakse verbindingslijnen, gespreide niveaus (boven/onder), vandaag-lijn, maandmarkeringen
- `TijdlijnSectie`: filter-wrapper (verantwoordelijke/status/discipline) + BekijkNokPuntModaal bij klik
- `ProjectTabbladen`: client component met tab "Lijst"/"Tijdlijn" op de projectpagina
- Tab "Lijst"/"Tijdlijn" in NokPuntenSectie (werfverslagpagina)
- Nieuw veld `startdatum` op Project (formulier + API + tijdlijn startpunt)

## Nieuwe bestanden
- `components/TijdlijnSVG.tsx`
- `components/TijdlijnSectie.tsx`
- `components/ProjectTabbladen.tsx`
- `prisma/migrations/20260605190548_startdatum_project/migration.sql`
