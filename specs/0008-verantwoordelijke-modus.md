---
kind: spec
id: "0008"
slug: verantwoordelijke-modus
title: "Verantwoordelijke-modus via magic link (kijk-en-afvink)"
type: feature
status: queued
created: 2026-06-04
---

## Doel

Wie via een magic link binnenkomt, ziet de verslagpagina in een beperkte "verantwoordelijke-modus":
enkel bekijken en afvinken. De bewerkende knoppen en menu's (toevoegen, notificaties, aanpassen,
verwijderen) zijn verborgen. De verslagmaker die rechtstreeks via het overzicht navigeert, ziet alles
zoals voorheen.

---

## Aanpassingen

### 1. Magic link signaleert de modus

- De redirect in `/afvinken/[token]` voegt een extra query-parameter toe:
  `/verslag/[id]?verantwoordelijke=<email>&modus=afvinken`.
- De verslag-detailpagina leest `searchParams.modus === "afvinken"` →
  boolean `verantwoordelijkeModus`.
- Belangrijk: enkel deze parameter activeert de modus. De verslagmaker die zelf op
  verantwoordelijke filtert (zonder `modus=afvinken`) behoudt alle knoppen.

### 2. Verborgen in verantwoordelijke-modus

Op `/verslag/[id]` worden in verantwoordelijke-modus verborgen:
- De knop **"+ NOK-punt"**.
- De knop **"Verstuur notificaties"**.
- Het **⋯-menu op elk NOK-punt** behoudt enkel **"Bekijk"**; "Aanpassen" en "Verwijderen" verdwijnen.
- Het **⋯-menu op elke aanwezige** verdwijnt volledig.

### 3. Behouden in verantwoordelijke-modus

- De filter- en sorteerbalk blijft werken (de verantwoordelijke mag zelf filteren/sorteren).
- **"Bekijk"** opent het detail-modaal.
- In het detail-modaal blijft **"Markeer als opgelost"** werken (kernactie van de verantwoordelijke).

### 4. Duidelijkheid voor de verantwoordelijke

- Boven de NOK-puntenlijst verschijnt in deze modus een subtiele melding:
  "Je bekijkt dit als verantwoordelijke. Je kan je punten bekijken en afvinken."

---

## Technische aanpak

- `verantwoordelijkeModus` (boolean) wordt doorgegeven:
  - `app/verslag/[id]/page.tsx` → `NokPuntenSectie` en `AanwezigenBeheer`.
  - `NokPuntenSectie` → `NokPuntenLijst` → `NokPuntKaart` (bepaalt de menu-opties).
- In `NokPuntKaart`: bij `verantwoordelijkeModus` enkel de optie "Bekijk" tonen.
- In `AanwezigenBeheer`: bij `verantwoordelijkeModus` het `DrieKnopjesMenu` niet renderen.

---

## Buiten scope

- Echte authenticatie of rollenbeheer (komt in BuildHub, zie draft-002).
- Verbergen van gegevens (de verantwoordelijke mag het volledige verslag blijven zien).
- Een aparte, los ontworpen afvink-pagina (we hergebruiken bewust de standaardpagina).
