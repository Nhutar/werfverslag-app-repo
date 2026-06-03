---
kind: spec
id: "0003"
slug: ui-verfijning-navigatie
title: "UI-verfijning: navigatie, verslaggever en lijstgedrag"
type: feature
status: queued
created: 2026-06-03
---

## Doel

Verfijning van de bestaande UI op basis van gebruikerstesten. Geen nieuwe functionaliteit,
enkel verbeteringen aan navigatie, lay-out en lijstgedrag zodat de app prettiger werkt op de werf.

---

## Aanpassingen

### 1. Verslaggever toevoegen

- Nieuw veld **"Verslaggever"** (enkel naam, geen e-mail) op het formulier `/nieuw`, bovenaan bij de verslagdetails.
- Verplicht veld.
- Database: nieuw veld `verslaggever` (String) op `werfverslag`.
- Tonen bovenaan op de verslag-detailpagina (`/verslag/[id]`), in het detailkader.

### 2. Aanwezigen — knop en volgorde (`/nieuw`)

- De knop **"+ Aanwezige toevoegen"** staat net onder de titel "Aanwezigen" (vaste plek, scrollt niet weg met de lijst).
- Een nieuw toegevoegde aanwezige verschijnt **bovenaan** de lijst (direct onder de knop), zodat de knop altijd bereikbaar blijft.
- De **verslagdetails** (verslaggever, naam werf, datum, werfadres) blijven sticky bovenaan op desktop.
- Op mobiel: compact sticky — enkel de werfnaam blijft zichtbaar bovenaan, de rest scrollt mee.

### 3. Terug-navigatie (overal)

De terugknop benoemt het **type pagina** waar je naartoe gaat:
- Vanuit verslag-detail (`/verslag/[id]`) → **"← Terug naar werfverslagen"**
- Vanuit nieuw verslag (`/nieuw`) → **"← Terug naar werfverslagen"**
- Vanuit NOK-punt toevoegen (`/verslag/[id]/nieuw-punt`) → **"← Terug naar project"**

### 4. Titels op de NOK-punt pagina (`/verslag/[id]/nieuw-punt`)

- Terugknop: "← Terug naar project"
- Grote zwarte titel: de **werfnaam** (bv. "Sprengers")
- Grijze subtitel eronder: **"NOK-punt toevoegen"**

### 5. NOK-punten lijst — knop en volgorde (`/verslag/[id]`)

- De knop **"+ NOK-punt"** staat op een vaste plek (bij de sectietitel "NOK-punten") én een tweede knop onderaan het kader.
- Nieuwe NOK-punten verschijnen **onderaan** (volgorde van toevoegen, nieuwste laatst en zichtbaar).
- De verslagdetails blijven sticky bovenaan (zelfde gedrag als bij aanwezigen).

### 6. Opgeloste NOK-punten — inklapbare sectie (`/verslag/[id]`)

- Open NOK-punten (geel/oranje/rood) staan bovenaan in volgorde van toevoegen.
- Opgeloste (groene) punten verhuizen naar een **aparte inklapbare sectie** onderaan: **"Opgelost (X)"**.
- De sectie is standaard ingeklapt en kan open/dichtgeklapt worden.

---

## Database wijziging

- `verslaggever` (String, verplicht) toegevoegd aan `werfverslag`.
- De API route `/api/verslagen` neemt `verslaggever` mee bij het aanmaken.

---

## Buiten scope

- Sorteren op urgentie en filteren per verantwoordelijke → Spec "Overzicht verfijnen" (later).
- NOK-punt effectief opslaan + foto-upload → volgende spec.
- E-mail en magic link → latere specs.
