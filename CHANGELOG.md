# Changelog

Versienummers volgen Semantic Versioning.
Type → bump: breaking→MAJOR, new-feature→MINOR, bug/refactoring/test→PATCH.

## [Unreleased]

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