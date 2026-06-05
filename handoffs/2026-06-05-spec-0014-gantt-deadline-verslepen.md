# Handoff — Spec 0014: Gantt deadline verslepen (v0.14.0)

Gedeploy op 2026-06-05. CI groen.

## Wat gebouwd is

- `TijdlijnSVG`: nieuwe prop `verslaggeVerModus` + `onDeadlineWijzig`
- Blokje-drag: `onMouseDown` op blokje start deadline-drag (stopt canvas-pan via stopPropagation)
- Datum-tooltip boven blokje tijdens slepen (zwart pill)
- Blauwe rand op actief sleepblokje
- Minimum = verslagdatum (kan niet eerder gesleept)
- Bij loslaten: PATCH `/api/nok-punten/[id]` met `{ deadlineOnly: true, deadline }`
- Foutmelding bij mislukte update, blokje springt terug
- `TijdlijnNokItem` heeft nieuw veld `verslagDatum` (doorgegeven vanuit `TijdlijnSectie`)
- `app/api/nok-punten/[id]/route.ts`: JSON-pad toegevoegd voor deadline-only update
