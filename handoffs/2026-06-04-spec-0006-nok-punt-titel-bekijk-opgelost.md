# Handoff — Spec 0006: NOK-punt titel, bekijk-modaal en opgelost markeren

**Datum:** 2026-06-04
**Versie:** v0.6.0
**PR:** #29

## Wat is gebouwd

- `titel` (verplicht, max 80 tekens) toegevoegd aan NOK-punt formulier en aanpassen-pagina.
- `omschrijving` is nu optioneel.
- NOK-punt kaart toont enkel de titel (compact, geen lange tekst).
- "Bekijk" optie in 3-puntjes menu → `BekijkNokPuntModaal` met alle details.
- "Markeer als opgelost" knop in het bekijk-modaal: naam (verplicht), omschrijving (optioneel), foto (optioneel).
- `POST /api/nok-punten/[id]/opgelost` endpoint.
- Database migratie: `titel TEXT NOT NULL` + `omschrijving` optioneel op `nok_punt`.

## Volgende stap (Spec 0007)

- "Verstuur notificaties" knop op verslag-detailpagina.
- 1 e-mail per unieke verantwoordelijke met al zijn NOK-punten (Resend + React Email).
- Magic link token genereren per NOK-punt.
- `/afvinken/[token]` pagina functioneel maken (verantwoordelijke markeert zelf als opgelost).
