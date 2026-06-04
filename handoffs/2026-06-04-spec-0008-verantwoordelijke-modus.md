# Handoff — Spec 0008: Verantwoordelijke-modus via magic link

**Datum:** 2026-06-04
**Versie:** v0.8.0
**PR:** #38

## Wat is gebouwd

- De magic link redirect voegt `&modus=afvinken` toe.
- De verslag-detailpagina activeert dan "verantwoordelijke-modus" en verbergt:
  - "+ NOK-punt" en "Verstuur notificaties" knoppen
  - "Aanpassen"/"Verwijderen" op NOK-punten (enkel "Bekijk" blijft)
  - Het ⋯-menu op aanwezigen (volledig)
- Behouden: filteren/sorteren, "Bekijk" → "Markeer als opgelost".
- Subtiele melding "Je bekijkt dit als verantwoordelijke."
- De verslagmaker die zelf op een verantwoordelijke filtert (zonder de parameter) behoudt alle knoppen.

## Te testen door Eduardo

1. Verstuur een notificatie naar jezelf.
2. Klik op de magic link in de mail.
3. Controleer dat "+NOK-punt", "Verstuur notificaties" en de aanpas/verwijder-menu's weg zijn.
4. Controleer dat "Bekijk" → "Markeer als opgelost" nog werkt.

## Volgende stappen (mogelijk)

- Eigen e-maildomein verifiëren in Resend (om naar echte ontvangers te sturen).
- Naam vooraf invullen in "Markeer als opgelost" via de magic link.
- Sessiecontext-bestand updaten (verouderd).
- Mobile + UX polish.
