# Handoff — Spec 0009: Projectlaag, dashboards en de omkering

**Datum:** 2026-06-04
**Versie:** v0.9.0
**PR:** #42

## Wat is gebouwd

Nieuwe hiërarchie: **Hoofddashboard → Project → Werfverslag → NOK-punten**.

- **Hoofddashboard** (`/`): lijst van projecten met statusbolletjes + "+ Nieuw project".
- **Project** (`/project/nieuw`, `/project/[id]/aanpassen`): naam, werfadres, bouwheer,
  beschrijving + lijst van **deelnemende verantwoordelijken**.
- **Projectdashboard** (`/project/[id]`): projectinfo + deelnemers + werfverslagen + "+ Nieuw werfverslag".
- **Werfverslag aanmaken** (`/project/[id]/verslag/nieuw`): verslaggever + datum +
  **aanwezigen aanvinken** uit de projectdeelnemers (de omkering).
- **NOK-punt-verantwoordelijke**: kiesbaar uit ALLE projectdeelnemers (niet enkel aanwezigen).
- Werfadres + naam verhuisd naar projectniveau.

## Datamodel

- Nieuw: `Project`, `ProjectDeelnemer`, `WerfverslagAanwezige` (join).
- `Werfverslag`: `projectId` toegevoegd; `naam`/`werfadres` verwijderd.
- `Aanwezige` (oud model) verwijderd.
- **Destructieve migratie**: bestaande testverslagen gewist (afgesproken).

## Belangrijke punten

- NOK-punt bewaart nog `verantwoordelijkeNaam`/`Email` (gedenormaliseerd). Bij het aanpassen
  van een projectdeelnemer worden de NOK-punten van dat project mee gesynchroniseerd.
- Notificaties: ontvangers = aanwezigen van het verslag (modi alle/specifiek) of
  verantwoordelijken met openstaande punten. Dedup op e-mail.
- Magic link + verantwoordelijke-modus (spec 0007/0008) blijven werken.

## Te testen door Eduardo

1. Nieuw project aanmaken met enkele deelnemers (gebruik je eigen e-mail bij minstens één).
2. Werfverslag aanmaken onder dat project → vink aanwezigen aan.
3. NOK-punt toevoegen → kies een verantwoordelijke uit de deelnemers.
4. Notificatie versturen → mail + magic link testen.
5. Project/werfverslag aanpassen en verwijderen.

## Mogelijke volgende stappen

- Eigen e-maildomein in Resend (echte ontvangers).
- Filteren/zoeken op het hoofddashboard (rest van draft-003).
- Mobile + UX polish.
- Planning/Gantt per project (draft-002).
