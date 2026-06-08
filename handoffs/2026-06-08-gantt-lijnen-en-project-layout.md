---
spec: "post-0015 Gantt lijnen fixes"
date: 2026-06-08
version: 0.15.12
prs: "#76 – #78"
---
# Gantt lijnproblemen en project layout (v0.15.10 → v0.15.12)

## Wat er landde

**Gantt lijnkleur (#76)**
- Standaard lijnkleur donkerder (#9CA3AF → #6B7280)
- "Zwart bij selectie" gedrag verwijderd — lijnen blijven altijd donkergrijs, niet-geselecteerde layers faden

**Gantt rendering volgorde (#77)**
- Verbindingslijnen als laatste getekend zodat ze niet bedekt worden door witte achtergrond van NOK-blokjes
- (Tijdelijke fix, vervangen door #78)

**Gantt layer-architectuur (#78)**
- Elk werfverslag is nu een eigen SVG `<g>`-layer
- Binnen elke layer: lijnen eerst → NOK-blokjes → datumblokje
- Volgorde: oudste verslag achtergrond, geselecteerde verslag voorgrond (rendered last)
- Bij selectie: andere layers op opacity 0.12
- Geen CSS transitions meer op individuele NOK-blokjes (geen compositing-problemen)

**Projectpagina layout (#78)**
- `items-start` op grid → rechtse kaart (opmerkingen) trekt niet meer mee omhoog bij lange deelnemerslijst

## Opmerkingen
- De layer-architectuur is een significante redesign van het render-gedeelte van TijdlijnSVG
- Als de Gantt problemen vertoont: `git revert b392028` zet terug naar staat voor #78
