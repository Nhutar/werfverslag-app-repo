---
kind: spec
id: "0006"
slug: nok-punt-titel-bekijk-opgelost
title: "NOK-punt: titel, bekijk-modaal en opgelost markeren"
type: feature
status: deployed
created: 2026-06-04
---

## Doel

NOK-punten krijgen een verplicht kort titelveld. De kaart toont enkel de titel (beknopt).
Via "Bekijk" in het 3-puntjes menu opent een modaal met alle details. Vanuit dat modaal
kan een punt als opgelost worden gemarkeerd.

---

## Aanpassingen

### 1. Database: titel toevoegen aan NOK-punt

- Nieuw veld `titel` (String, verplicht) op `NokPunt`.
- `omschrijving` blijft bestaan maar wordt optioneel (String?).
- Migratie: `ADD COLUMN titel TEXT NOT NULL DEFAULT ''`, daarna `DROP DEFAULT`.
  Uitvoeren via `--create-only` + manuele SQL aanpassing + `migrate dev`.

---

### 2. Formulier: nieuw NOK-punt (`/verslag/[id]/nieuw-punt`)

- Nieuw veld **"Titel"** (verplicht, max ~80 tekens) bovenaan het formulier, vóór omschrijving.
  Placeholder: "bv. Raam niet waterdicht"
- **"Omschrijving"** wordt optioneel (label zonder sterretje, placeholder "Optionele details...").
- Opslaan stuurt `titel` mee naar de API.

---

### 3. Formulier: NOK-punt aanpassen (`/verslag/[id]/punt/[nokPuntId]/aanpassen`)

- Zelfde aanpassing: `titel` veld toevoegen (verplicht), omschrijving optioneel.
- Vooringevuld met bestaande waarden.

---

### 4. NOK-punt kaart (`components/NokPuntenLijst.tsx`)

- De kaart toont **enkel de titel** als hoofdtekst (niet de omschrijving).
- De omschrijving is niet zichtbaar op de kaart (enkel in het bekijk-modaal).
- Lay-out blijft verder ongewijzigd (statusbadge, discipline, verantwoordelijke, deadline, foto-thumbnails).

---

### 5. "Bekijk" in het 3-puntjes menu

- Derde optie "Bekijk" toegevoegd aan het 3-puntjes menu van een NOK-punt-kaart,
  bovenaan de lijst (vóór "Aanpassen" en "Verwijderen").
- Opent een **modaal** (zweeft gecentreerd boven de pagina, zelfde stijl als het aanwezige-modaal).

**Inhoud van het bekijk-modaal:**
- Titel (groot, vet)
- Statusbadge + discipline-tag
- Omschrijving (indien ingevuld)
- Foto's (als rij thumbnails, klikbaar naar volledig formaat)
- Verantwoordelijke (naam + e-mail)
- Deadline
- Indien opgelost: opgelost op (datum) + door wie + omschrijving oplossing + foto oplossing

**Onderaan het modaal:**
- Als het punt **niet opgelost** is: knop **"Markeer als opgelost"** (blauw)
- Als het punt **al opgelost** is: geen knop, enkel de oplossingsinformatie
- Sluitknop (✕) rechtsboven

---

### 6. "Markeer als opgelost" in het bekijk-modaal

Klikken op "Markeer als opgelost" toont een tweede sectie in het modaal:

- Veld **"Opgelost door"** (naam, verplicht) — vrij tekstveld
- Veld **"Omschrijving oplossing"** (optioneel)
- Foto van de oplossing (optioneel, max 1 foto, zelfde upload-logica als bij NOK-punt)
- Knop **"Bevestig oplossing"** → roept `POST /api/nok-punten/[id]/opgelost` aan
- Knop **"Annuleren"** → terug naar de details

**API: POST /api/nok-punten/[id]/opgelost**
- Accepteert: `opgelostDoorNaam` (verplicht), `oplossingOmschrijving` (optioneel), foto (optioneel)
- Uploadt de foto naar Supabase Storage (map: `{verslagId}/{nokPuntId}/oplossing-{timestamp}-{naam}`)
- Zet `status = "opgelost"`, `opgelostOp = now()`, `opgelostDoorNaam`, `oplossingOmschrijving`, `oplossingFotoUrl`
- Na bevestiging: modaal sluit, pagina herlaadt

---

## API wijzigingen

| Route | Wijziging |
|-------|-----------|
| `POST /api/verslagen/[id]/nok-punten` | `titel` toevoegen (verplicht) |
| `PATCH /api/nok-punten/[id]` | `titel` toevoegen (verplicht) |
| `GET /api/nok-punten/[id]` | `titel` teruggeven |
| `POST /api/nok-punten/[id]/opgelost` | Nieuw endpoint |

---

## Buiten scope

- De magic link `/afvinken/[token]` pagina (verantwoordelijke markeert zelf als opgelost) → Spec 0007.
- Bulk-acties op meerdere NOK-punten tegelijk.
- Reacties of opmerkingen toevoegen aan een punt.
