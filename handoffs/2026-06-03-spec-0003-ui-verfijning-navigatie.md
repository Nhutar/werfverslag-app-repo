# Handoff — Spec 0003: UI-verfijning navigatie en lijstgedrag

**Datum:** 2026-06-03
**Versie:** 0.3.0
**Status:** deployed ✅

## Wat is gebouwd

UI-verfijningen op basis van gebruikerstesten van Spec 0002. Geen nieuwe functionaliteit.

### Wijzigingen

1. **Verslaggever** — nieuw veld (enkel naam, verplicht) op `/nieuw`, getoond bovenaan op detailpagina.
2. **Aanwezigen** — nieuwe aanwezige verschijnt bovenaan de lijst, knop "+ Aanwezige toevoegen" blijft op vaste plek.
3. **Sticky verslagdetails** — blijven bovenaan op desktop; op mobiel enkel werfnaam + verslaggever sticky, rest in apart kader eronder.
4. **Terug-navigatie** — benoemt doeltype: "Terug naar werfverslagen" (vanuit detail/nieuw) en "Terug naar project" (vanuit NOK-punt).
5. **NOK-punt pagina** — werfnaam als grote titel, "NOK-punt toevoegen" als grijze subtitel.
6. **NOK-punten lijst** — nieuwste onderaan (volgorde van toevoegen); opgeloste punten in inklapbare sectie "Opgelost (X)" onderaan.
7. **Tweede "+ NOK-punt" knop** onderaan het kader.

### Nieuwe/gewijzigde bestanden

- `components/NokPuntenLijst.tsx` — nieuw client component (inklapbare opgelost-sectie)
- `app/nieuw/page.tsx` — verslaggever-veld, aanwezigen bovenaan, sticky
- `app/verslag/[id]/page.tsx` — verslaggever tonen, sticky, NokPuntenLijst, tweede knop
- `app/verslag/[id]/nieuw-punt/page.tsx` — titels en terug-navigatie
- `app/api/verslagen/route.ts` — verslaggever meegeven

### Database

- `verslaggever` (String, verplicht) toegevoegd aan `werfverslag`.
- Migratie gebruikt tijdelijke default 'Onbekend' voor 3 bestaande testrijen, daarna default verwijderd.

## Bekende beperkingen

- NOK-punt opslaan + foto-upload nog niet geïmplementeerd (volgende spec)
- E-mail en magic link nog niet geïmplementeerd
- Sorteren op urgentie + filteren per verantwoordelijke → "Overzicht verfijnen" (later)

## Volgende spec

NOK-punt formulier effectief opslaan in database + foto-upload via Supabase Storage.
