# Handoff — Spec 0005: Aanpassen en verwijderen via 3-puntjes menu

**Datum:** 2026-06-04
**Versie:** v0.5.0
**PR:** #24

## Wat is gebouwd

- 3-puntjes menu (⋯) op werfverslag-kaarten, aanwezigen en NOK-punt-kaarten.
- Elk menu heeft "Aanpassen" en "Verwijderen".
- Herbruikbare componenten: `DrieKnopjesMenu`, `BevestigingDialog`, `VerslagKaartLijst`, `AanwezigenBeheer`.
- Werfverslag aanpassen: `/verslag/[id]/aanpassen` (naam, verslaggever, datum, werfadres).
- Aanwezige aanpassen: modaal op de detailpagina (naam, discipline, e-mail).
- NOK-punt aanpassen: `/verslag/[id]/punt/[nokPuntId]/aanpassen` (omschrijving, verantwoordelijke, deadline, foto's beheren).
- Verwijderen met bevestigingsdialoog; extra waarschuwing bij verslag met NOK-punten.
- Cascade verwijdering: foto's uit Supabase Storage + magic link tokens worden mee verwijderd.
- Nieuwe API routes: PATCH + DELETE op `/api/verslagen/[id]`, `/api/aanwezigen/[id]`, `/api/nok-punten/[id]`.

## Volgende stap (Spec 0006)

- "Verstuur notificaties" knop op verslag-detailpagina.
- 1 e-mail per unieke verantwoordelijke met al zijn NOK-punten (Resend + React Email).
- Magic link token genereren per NOK-punt.
- `/afvinken/[token]` pagina functioneel maken.
