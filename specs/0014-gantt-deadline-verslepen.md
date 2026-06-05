---
id: "0014"
title: Gantt — deadline verslepen
slug: gantt-deadline-verslepen
status: queued
---

## Doel

In de tijdlijn (Gantt) kan de verslaggever een NOK-punt blokje horizontaal slepen
om de deadline te wijzigen. De verantwoordelijke kan dit niet (blokjes zijn
read-only in verantwoordelijke-modus).

---

## Gedrag

### Onderscheid slepen vs klikken

Er zijn twee sleepbewegingen op de tijdlijn:
- **Canvas-pan**: slepen op een leeg gebied of verslag-knooppunt → verschuift de
  tijdlijn (bestaand gedrag)
- **Blokje-drag**: slepen op een NOK-punt blokje → wijzigt de deadline

De twee worden onderscheiden door `onMouseDown` op het blokje te stoppen
(`stopPropagation`) zodat het canvas-pan niet triggert.

### Visueel tijdens slepen

- Cursor op blokje: `ew-resize` (horizontale pijlen)
- Tijdens slepen: blokje volgt de muis horizontaal, verbindingslijn herpositioneert
  mee in real-time
- Datum-tooltip boven het blokje: toont de nieuwe deadline als korte datumstring
  ("ma 14 jul") die live bijwerkt tijdens het slepen
- Het blokje krijgt een lichtblauwe rand (`border: 2px solid #3B82F6`) tijdens
  het slepen als visuele feedback
- Snappen op dag: de deadline wordt afgerond naar de dichtstbijzijnde dag

### Na loslaten

1. De nieuwe deadline wordt via `PATCH /api/nok-punten/[id]` (bestaande route)
   naar de server gestuurd met enkel het `deadline`-veld bijgewerkt
2. De tijdlijn herlaadt de data (`router.refresh()`)
3. Bij een netwerk- of validatiefout: het blokje springt terug naar de originele
   positie en er verschijnt een korte foutmelding ("Deadline kon niet worden
   bijgewerkt")

### Begrenzingen

- De deadline mag niet vóór de datum van het werfverslag worden gesleept
  (minimum = verslagdatum)
- Geen maximale datum (toekomstige deadlines zijn toegestaan)

---

## Implementatie

### TijdlijnSVG aanpassingen

Het blokje-element krijgt aparte muishandlers:

```
onMouseDown (blokje) → start blokje-drag, stopPropagation
onMouseMove (container) → als blokje-drag actief: verplaats blokje
onMouseUp (container) → beëindig drag, sla op via API
```

State die bijgehouden wordt tijdens drag:
- `sleepNok: { id, origineleDeadline, huidigeDeadline, verslagDatum } | null`

### API — bestaande PATCH route

De bestaande `PATCH /api/nok-punten/[id]` accepteert reeds een `deadline`-veld
als onderdeel van het volledige formulier. De route wordt uitgebreid met een
**snelle deadline-update**: als enkel `deadlineOnly: true` + `deadline` worden
meegegeven, wordt enkel de deadline bijgewerkt zonder de andere verplichte velden
te valideren.

### Props

`TijdlijnSVG` krijgt een extra optionele prop:

```typescript
verslaggeверModus?: boolean  // standaard false; true = blokjes zijn sleepbaar
```

`TijdlijnSectie` en `ProjectTabbladen` geven `verslaggeVerModus={!verantwoordelijkeModus}`
door.

---

## Scope / buiten scope

**In scope:**
- Horizontaal slepen van NOK-blokje in de tijdlijn
- Datum-tooltip tijdens slepen
- Snappen op dag
- API-update bij loslaten
- Foutafhandeling (terugspringen bij fout)
- Enkel in verslaggever-modus

**Buiten scope:**
- Slepen in de lijst-weergave
- Slepen van de startdatum (enkel deadline)
- Touch/mobile slepen
