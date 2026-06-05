---
id: "0015"
title: Opmerkingen, chat & layout herwerking
slug: opmerkingen-chat-layout
status: queued
---

## Doel

1. **Layout herwerking** — projectpagina en werfverslagpagina krijgen een bredere
   2-kolommen structuur bovenaan (info links, opmerkingen rechts) met volle breedte
   onderaan (Gantt/verslagenlijst of NOK-lijst).
2. **Opmerkingen per project en per werfverslag** — een scrollbaar paneel met
   berichten (tekst + optionele foto's), zichtbaar in de rechterkolom.
3. **Chat per NOK-punt** — een berichtenthread binnen het bekijk-modaal van een
   NOK-punt, toegankelijk voor verslaggever én verantwoordelijke via magic link.
   E-mailnotificatie bij nieuw bericht.
4. **Automatische naam** — bij "markeer als opgelost" en bij chatberichten wordt
   de naam automatisch ingevuld vanuit de magic link (geen handmatig invulveld meer
   voor de verantwoordelijke).

---

## Datamodel — nieuw model `Opmerking`

```
model Opmerking {
  id            String      @id @default(uuid())
  projectId     String?     @map("project_id")
  project       Project?    @relation(...)
  werfverslagId String?     @map("werfverslag_id")
  werfverslag   Werfverslag? @relation(...)
  nokPuntId     String?     @map("nok_punt_id")
  nokPunt       NokPunt?    @relation(...)
  auteurNaam    String      @map("auteur_naam")
  auteurRol     String      @map("auteur_rol")  // "verslaggever" | "verantwoordelijke"
  tekst         String
  fotoUrls      String[]    @default([]) @map("foto_urls")
  aangemaaktOp  DateTime    @default(now()) @map("aangemaakt_op")

  @@map("opmerking")
}
```

Eén van de drie context-velden (`projectId`, `werfverslagId`, `nokPuntId`) is
ingesteld per opmerking. De andere twee zijn `null`.

---

## Layout herwerking

### Projectpagina (`/project/[id]`)

**Bovenste sectie** — 2 kolommen naast elkaar:
- Links (~55%): bestaande projectkaart (naam, adres, bouwheer, deelnemers)
- Rechts (~45%): opmerkingen-paneel voor dit project

**Onderste sectie** — volle breedte:
- Bestaande `ProjectTabbladen` (Lijst / Tijdlijn) met werfverslagenlijst en Gantt

De pagina wordt breder: van `max-w-2xl` naar `max-w-6xl`.

### Werfverslagpagina (`/verslag/[id]`)

**Bovenste sectie** — 2 kolommen naast elkaar:
- Links (~55%): bestaande verslagkaart (projectnaam, datum, verslaggever, aanwezigen)
- Rechts (~45%): opmerkingen-paneel voor dit verslag

**Onderste sectie** — volle breedte:
- Bestaande `NokPuntenSectie` (Lijst / Tijdlijn) met NOK-punten

De pagina wordt ook breder: van `max-w-2xl` naar `max-w-6xl`.

---

## Opmerkingen-paneel (project + verslag)

### Weergave

- Scrollbaar vak met vaste hoogte (~300px) met overflow-y scroll
- Berichten getoond van oud naar nieuw (nieuwste onderaan)
- Per bericht:
  - Naam auteur + rol (kleine badge)
  - Datum en tijdstip
  - Tekst
  - Foto's (thumbnails, klikbaar voor volledig scherm)
- Onderaan het paneel: invoerformulier

### Invoerformulier

- Tekstinput (meerdere regels)
- Optioneel: foto uploaden (max 3, max 10 MB elk, Supabase Storage bucket `nok-fotos`)
- Naam-veld: **vrij in te vullen** (geen account → auteur typt zijn naam)
- Knop "Verstuur"
- In verantwoordelijke-modus (magic link): **naam automatisch ingevuld** vanuit de
  magic link, niet bewerkbaar

### Rol-badge kleuren

- verslaggever: grijs
- verantwoordelijke: blauw

---

## Chat per NOK-punt

### Locatie

Onderaan het bestaande `BekijkNokPuntModaal`, na de historiek-sectie.
Een collapsible sectie "Berichten" (standaard ingeklapt, opent bij klik).

### Gedrag

- Laadt berichten voor dit NOK-punt via `GET /api/opmerkingen?nokPuntId=<id>`
- Invoerformulier zelfde als het opmerkingen-paneel
- In verantwoordelijke-modus: naam automatisch ingevuld, niet bewerkbaar
- In verslaggever-modus: naam vrij in te vullen

### E-mailnotificaties

Bij een nieuw chatbericht op een NOK-punt:

**Als verslaggever een bericht schrijft:**
- Stuur e-mail naar de verantwoordelijke van het NOK-punt
- Aanmaken van een nieuwe `MagicLinkToken` (zelfde logica als notificaties)
- E-mail: onderwerp "Nieuw bericht — [nokpunt titel]", inhoud: tekst van het
  bericht + knop naar het verslag

**Als verantwoordelijke een bericht schrijft (via magic link):**
- Geen notificatie aan verslaggever (geen e-mail van verslaggever bekend in het systeem)

---

## Automatische naam bij "markeer als opgelost"

In de verantwoordelijke-modus wordt het naam-invulveld verwijderd uit het
oplossingsformulier in `BekijkNokPuntModaal`. De naam wordt automatisch
ingevuld vanuit de `verantwoordelijkeNaam` die via de URL-parameter/magic link
beschikbaar is.

`NokPuntenSectie` geeft `verantwoordelijkeNaam` door aan `NokPuntenLijst` →
`BekijkNokPuntModaal` via de bestaande prop-structuur.

---

## Nieuwe API-routes

| Methode | Route | Beschrijving |
|---|---|---|
| `GET` | `/api/opmerkingen?projectId=` | Opmerkingen voor een project |
| `GET` | `/api/opmerkingen?werfverslagId=` | Opmerkingen voor een verslag |
| `GET` | `/api/opmerkingen?nokPuntId=` | Opmerkingen (chat) voor een NOK-punt |
| `POST` | `/api/opmerkingen` | Nieuwe opmerking aanmaken |

### POST body

```json
{
  "projectId": "...",        // of werfverslagId of nokPuntId
  "auteurNaam": "...",
  "auteurRol": "verslaggever",
  "tekst": "...",
  "fotoUrls": []             // reeds geüploade URLs (upload apart via Supabase)
}
```

Foto-upload verloopt client-side rechtstreeks naar Supabase Storage
(zelfde bucket `nok-fotos`, pad `opmerkingen/<context-id>/<timestamp>-<naam>`).

---

## Nieuwe componenten

- `OpmerkingPaneel` — scrollbaar paneel met berichten + invoer (herbruikbaar voor
  project, verslag en NOK-punt chat)
- `OpmerkingBericht` — weergave van één bericht
- `OpmerkingInvoer` — invoerformulier (tekst + foto + naam)

---

## Scope / buiten scope

**In scope:**
- Datamodel `Opmerking` + migratie
- Layout herwerking project- en verslagpagina (max-w-6xl, 2 kolommen boven)
- Opmerkingen-paneel per project en per werfverslag
- Chat per NOK-punt in bekijk-modaal
- E-mail bij nieuw NOK-chatbericht (naar verantwoordelijke)
- Automatische naam bij opgelost markeren + chatberichten (verantwoordelijke-modus)

**Buiten scope:**
- Notificatie aan verslaggever bij bericht van verantwoordelijke
- Opmerkingen verwijderen of bewerken
- Reacties/likes op berichten
- Real-time updates (polling of websockets)
