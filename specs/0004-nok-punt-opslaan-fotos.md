---
kind: spec
id: "0004"
slug: nok-punt-opslaan-fotos
title: "NOK-punt opslaan + foto's"
type: feature
status: deployed
created: 2026-06-04
---

## Doel

Het formulier `/verslag/[id]/nieuw-punt` functioneel maken: een NOK-punt effectief opslaan
in de database, inclusief foto-upload naar Supabase Storage (max 5 foto's).
Verantwoordelijke wordt gekozen uit de aanwezigenlijst van het verslag.

---

## Aanpassingen

### 1. Database: meerdere foto's ondersteunen

- `fotoUrl String?` op `NokPunt` vervangen door `fotoUrls String[]` (PostgreSQL array, standaard leeg).
- Migratie via `npx prisma migrate dev --name nok-punt-fotos-array`.

### 2. API route: POST /api/verslagen/[id]/nok-punten

Nieuw bestand: `app/api/verslagen/[id]/nok-punten/route.ts`

**Werking:**
1. Ontvang multipart form-data: `discipline`, `omschrijving`, `aanwezigeId`, `deadline`, en 0–5 foto-bestanden.
2. Haal de `Aanwezige` op via `aanwezigeId` → gebruik `naam` en `email` als `verantwoordelijkeNaam` / `verantwoordelijkeEmail`.
3. Upload elk foto-bestand naar Supabase Storage bucket `nok-fotos`:
   - Pad: `{verslagId}/{nokPuntId}/{timestamp}-{bestandsnaam}`
   - Geef een publieke URL terug via `supabase.storage.from('nok-fotos').getPublicUrl(pad)`.
4. Sla het `NokPunt` op in de database met `status: "open"` en de lijst van foto-URLs.
5. Geef `{ id: nokPuntId }` terug als JSON (201).

**Validatie:**
- `discipline`, `omschrijving`, `aanwezigeId`, `deadline` zijn verplicht.
- Max 5 foto-bestanden; elk bestand max 10 MB.
- `deadline` moet een geldige datum zijn.

### 3. Formulier: Client Component

`app/verslag/[id]/nieuw-punt/page.tsx` ombouwen naar een Client Component (`"use client"`).

**Verantwoordelijke dropdown:**
- Dropdown met de aanwezigen (id als value, `{naam} — {discipline}` als label).
- Bij keuze: toont onder de dropdown de naam en het e-mailadres van de gekozen aanwezige (read-only, grijs).
- Als er geen aanwezigen zijn: oranje waarschuwing (gedrag ongewijzigd).

**Foto-upload (max 5):**
- Upload-knop opent bestandskiezer met `accept="image/*"`.
- Op mobiel: voeg ook `capture="environment"` toe zodat de camera direct opent als standaardoptie (gebruiker kan ook kiezen uit galerij).
- Na kiezen: thumbnail-preview van de gekozen foto's, met een ✕-knop per foto om te verwijderen.
- Als het maximum van 5 bereikt is: upload-knop verdwijnt.
- Foto's worden pas geüpload bij het indienen van het formulier (niet meteen).

**Opslaan-knop:**
- Label: "Opslaan"
- Bij klikken: toont laadstatus (spinner of "Bezig met opslaan...").
- Bij succes: redirect naar `/verslag/{id}`.
- Bij fout: foutmelding tonen onder het formulier.

**Annuleren-knop:**
- Navigeert terug naar `/verslag/{id}` zonder op te slaan.

**Placeholder-melding verwijderen:**
- De blauwe info-box ("Spec 0003 — ...") wordt verwijderd.

### 4. Verslag-detailpagina: foto's tonen

Op `/verslag/[id]` worden de foto's van een NOK-punt getoond als kleine thumbnails (max 3 zichtbaar, rest achter "Meer").

---

## Database wijziging

```prisma
model NokPunt {
  // fotoUrl String?  @map("foto_url")   ← verwijderd
  fotoUrls String[]  @default([]) @map("foto_urls")
  ...
}
```

Migratie-naam: `nok-punt-fotos-array`

---

## Supabase Storage

- Bucket: `nok-fotos` (bestaat al, privé).
- Bestanden zijn publiek leesbaar via `getPublicUrl` (bucket-niveau read policy).
- Upload gebeurt via de Supabase service role key (server-side, niet client-side).

---

## Buiten scope

- E-mail versturen en magic link genereren → Spec 0005.
- "Verstuur notificaties" knop → Spec 0005.
- Foto's bij het afvinken van een punt → Spec 0005 of later.
- Foto's in het globale overzicht → Spec 0006 (overzicht verfijnen).
