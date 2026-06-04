# Changelog

Versienummers volgen Semantic Versioning.
Type → bump: breaking→MAJOR, new-feature→MINOR, bug/refactoring/test→PATCH.

## [Unreleased]

## [0.5.0] — 2026-06-04

### Added
- Spec 0005: 3-puntjes menu (⋯) op werfverslag-kaarten, aanwezigen en NOK-punten
- Werfverslag aanpassen: nieuwe pagina `/verslag/[id]/aanpassen` (naam, verslaggever, datum, werfadres)
- Aanwezige aanpassen: modaal op de detailpagina (naam, discipline, e-mail)
- NOK-punt aanpassen: nieuwe pagina `/verslag/[id]/punt/[nokPuntId]/aanpassen` (omschrijving, verantwoordelijke, deadline, foto's)
- Foto's aanpassen: bestaande foto's individueel verwijderen, nieuwe toevoegen (tot max 5)
- Verwijderen met bevestigingsdialoog op alle drie plaatsen
- Extra waarschuwing bij verwijderen van verslag met NOK-punten
- Cascade verwijdering: foto's, tokens en punten worden mee verwijderd
- Herbruikbare componenten: DrieKnopjesMenu, BevestigingDialog, VerslagKaartLijst, AanwezigenBeheer
- API routes: PATCH + DELETE voor verslagen, aanwezigen en NOK-punten

## [0.4.1] — 2026-06-04

### Changed
- Discipline-veld verwijderd uit het NOK-punt formulier; discipline wordt automatisch overgenomen van de gekozen verantwoordelijke
- Nieuwste NOK-punten verschijnen bovenaan de lijst (nieuwste eerst)
- Onderste "+ NOK-punt toevoegen" knop verwijderd

## [0.4.0] — 2026-06-04

### Added
- Spec 0004: NOK-punt formulier functioneel — opslaan in database via POST /api/verslagen/[id]/nok-punten
- Foto-upload naar Supabase Storage (max 5 foto's, camera op mobiel + bestandskiezer)
- Foto-thumbnails zichtbaar op de verslag-detailpagina per NOK-punt
- Verantwoordelijke kiezen uit aanwezigen, e-mailadres wordt automatisch getoond
- GET /api/verslagen/[id] endpoint voor het formulier

### Changed
- NokPunt.fotoUrl (enkelvoud) vervangen door NokPunt.fotoUrls (array, max 5)
- Nieuw-punt pagina omgebouwd van Server Component naar Client Component

## [0.3.1] — 2026-06-03

### Changed
- Onderste "+ NOK-punt toevoegen" knop verschijnt enkel als er al NOK-punten zijn (geen dubbele knop bij lege lijst)

## [0.3.0] — 2026-06-03

### Added
- Spec 0003: Verslaggever-veld (naam) toegevoegd aan verslag, getoond op detailpagina
- Opgeloste NOK-punten in aparte inklapbare sectie "Opgelost (X)" onderaan
- Tweede "+ NOK-punt toevoegen" knop onderaan het kader

### Changed
- Aanwezigen verschijnen nu bovenaan de lijst (knop blijft bereikbaar)
- Verslagdetails sticky bovenaan op desktop, compact op mobiel
- Terug-navigatie benoemt het doeltype: "Terug naar werfverslagen" / "Terug naar project"
- NOK-punt pagina: werfnaam als titel, "NOK-punt toevoegen" als subtitel
- NOK-punten lijst toont nieuwste onderaan (volgorde van toevoegen)

## [0.2.0] — 2026-06-03

### Added
- Spec 0002: Alle 5 pagina's gebouwd met clean Monday.com-stijl UI
- Pagina 1: Overzicht verslagen met statusindicatoren per verslag
- Pagina 2: Nieuw verslag aanmaken met aanwezigenlijst (discipline + naam + e-mail)
- Pagina 3: Verslag detail met gesorteerde NOK-puntenlijst en statusbadges
- Pagina 4: NOK-punt toevoegen (UI klaar, opslaan komt in Spec 0003)
- Pagina 5: Magic link afvinken (UI klaar, logica komt in Spec 0005)
- lib/disciplines.ts: vaste disciplinelijst (13 + Andere)
- lib/status.ts: statusindicatoren met 7-dagenregel voor bijna-deadline
- components/StatusBadge.tsx: herbruikbaar statusbadge component
- Database uitgebreid: werfadres, aanwezige-tabel, oplossing-velden op nok_punt
- Prisma 7 adapter-pg geconfigureerd voor runtime databaseverbinding

## [0.0.1] — 2026-06-02

### Added
- Initieel project skelet aangemaakt.