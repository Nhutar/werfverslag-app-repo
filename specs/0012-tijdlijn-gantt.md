---
id: "0012"
title: Tijdlijn (Gantt)
slug: tijdlijn-gantt
status: deployed
---

## Doel

Een visuele tijdlijn per project en per werfverslag. De tijdlijn toont werfverslagen
als knooppunten op een horizontale hoofdlijn, met NOK-punten als klikbare blokjes
gepositioneerd op hun deadline-datum. Zo krijgt de gebruiker in één oogopslag een
overzicht van alle openstaande en opgeloste punten in de tijd.

---

## Twee weergaven

### 1. Project-tijdlijn

- Toegankelijk via een tabblad **"Tijdlijn"** op de projectpagina (`/project/[id]`)
- Toont **alle werfverslagen** van het project als knooppunten op de hoofdlijn
- Toont **alle NOK-punten** van alle verslagen, elk gepositioneerd op hun deadline-datum
- Elke NOK-lijn vertrekt vanuit het werfverslag-knooppunt en eindigt bij het
  NOK-blokje op de deadline-positie
- Filterbaar op verantwoordelijke, status en discipline

### 2. Verslag-tijdlijn

- Toegankelijk via een tabblad **"Tijdlijn"** op de werfverslagpagina (`/verslag/[id]`)
- De hoofdlijn heeft één knooppunt: de datum van dit verslag
- Toont enkel de NOK-punten van dit verslag, gepositioneerd op hun deadline-datum
- Zelfde filteropties

---

## Datamodel — wijziging aan `Project`

| Veld | Type | Verplicht | Beschrijving |
|---|---|---|---|
| `startdatum` | `DateTime? @db.Date` | nee | Startdatum van de werf |

De tijdlijn begint op `startdatum` als die ingesteld is, anders op de datum van het
vroegste werfverslag. Het veld wordt toegevoegd aan het projectformulier
(nieuw + aanpassen) als optioneel datumveld.

---

## Visuele opbouw (SVG)

De tijdlijn wordt gerenderd als een **SVG-component** in React. De pagina is
horizontaal scrollbaar als het project lang loopt.

### Hoofdlijn

- Horizontale lijn van links (startdatum/eerste verslag) naar rechts (laatste deadline + marge)
- Pijl aan het rechteruiteinde
- Label "projectlijn" links van de lijn (projectnaam)

### Vandaag-lijn

- Verticale blauwe stippellijn op de positie van vandaag
- Label "Vandaag" bovenaan

### Werfverslag-knooppunten

- Kleine rechthoek op de hoofdlijn op de datum van het verslag
- Label met de datum (bv. "05 jun") boven of onder de lijn

### NOK-punt blokjes

- Rechthoekig blokje met:
  - Titel van het NOK-punt (afgekort als het te lang is)
  - Gekleurde statusstip (zelfde kleuren als de bestaande StatusBadge)
- Horizontale positie = deadline-datum van het NOK-punt
- Verticale positie = boven of onder de hoofdlijn, afwisselend gespreid om
  overlap te vermijden. NOK-punten van hetzelfde verslag worden gegroepeerd
  en gespreid (eerste boven, tweede onder, derde verder boven, enz.)
- **Klikbaar**: opent het bestaande `BekijkNokPuntModaal`

### Verbindingslijnen

- **Haakse (orthogonale) lijnen**: vanuit het werfverslag-knooppunt, eerst verticaal
  omhoog of omlaag, dan horizontaal naar het NOK-blokje
- Kleur: lichtgrijs (`#d1d5db`)

---

## Filtering

Zelfde filteropties als de bestaande NOK-puntenlijst:
- Verantwoordelijke (dropdown)
- Status (dropdown): alle / open / bijna deadline / voorbij deadline /
  wacht op goedkeuring / opgelost
- Discipline (dropdown)

Gefilterde NOK-punten worden verborgen (hun blokje en verbindingslijn verdwijnen).
Werfverslag-knooppunten blijven altijd zichtbaar.

---

## Tabbladen op de project- en verslagpagina

### Projectpagina (`/project/[id]`)

Boven de werfverslagenlijst komen twee tabbladen:
- **Verslagen** (huidig gedrag, standaard actief)
- **Tijdlijn** (nieuwe weergave)

### Werfverslagpagina (`/verslag/[id]`)

Boven de NOK-puntenlijst komen twee tabbladen:
- **Lijst** (huidig gedrag, standaard actief)
- **Tijdlijn** (nieuwe weergave)

De tabbladen worden client-side gewisseld (geen aparte route).

---

## Startdatum in het projectformulier

Het projectformulier (`/project/nieuw` en `/project/[id]/aanpassen`) krijgt een
optioneel veld **"Startdatum werf"** (datuminput) in het blok "Projectgegevens".
De API-routes voor projecten worden uitgebreid met het veld `startdatum`.

---

## Technische aanpak

- Rendering via **SVG** in een React client-component (`TijdlijnSVG`)
- Breedte berekend op basis van de tijdspanne (px per dag, minimaal 40px/dag)
- De omvattende container krijgt `overflow-x: auto` (horizontaal scrollbaar)
- Geen externe bibliotheek nodig
- Het modaal dat opent bij klikken op een NOK-blokje is het bestaande
  `BekijkNokPuntModaal` (zelfde fetch + render als in de lijst)

---

## Scope / buiten scope

**In scope:**
- Datamodelwijziging `startdatum` + migratie
- Startdatum in projectformulier + API
- `TijdlijnSVG`-component (project- én verslagvariant)
- Tabbladen op project- en verslagpagina
- Filtering (client-side)
- Klikbaar naar BekijkNokPuntModaal

**Buiten scope:**
- Slepen of vergroten van blokjes
- Exporteren als afbeelding of PDF
- Globale tijdlijn over alle projecten
- Afhankelijkheden tussen NOK-punten (pijlen van het ene punt naar het andere)
