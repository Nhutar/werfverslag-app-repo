---
kind: draft
id: "003"
slug: overzicht-verfijnen
title: "Overzicht verfijnen: filteren en sorteren"
type: feature
status: draft
created: 2026-06-03
---

## Idee

Verbeteringen aan de overzichtspagina's zodra er veel verslagen en NOK-punten zijn.

### Overzicht werfverslagen (`/`)
- **Filteren op werf-/projectnaam** via een dropdownmenu, samengesteld uit alle bestaande namen.
- (Later, volledige app: groeperen per project — zie draft-002.)

### NOK-punten binnen een verslag (`/verslag/[id]`)
- **Sorteren op urgentie** (voorbij-deadline → bijna-deadline → open → opgelost).
  Standaard staat de lijst nu op volgorde van toevoegen; dit wordt een optionele sorteerknop.
- **Filteren per verantwoordelijke** — toon enkel de punten van één gekozen verantwoordelijke.

## Open vragen

- Moeten filter en sortering hun keuze onthouden tussen sessies?
- Filteren op meerdere criteria tegelijk, of één tegelijk?
- Bij sorteren op urgentie: blijft de inklapbare "Opgelost"-sectie behouden?

## Buiten scope

- Echte projectstructuur met groepering → volledige app (draft-002)
- Dit is een prototype-verfijning, te bouwen na de kernfunctionaliteit (opslaan, e-mail, magic link)
