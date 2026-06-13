---
spec: "post-0015 Gantt sessie + toegangsbeveiliging"
date: 2026-06-08
version: 0.15.13
prs: "#73 – #82"
---
# Sessie 2026-06-08 — Gantt fixes, drie-passes rendering, beveiliging

## Wat er landde

### Gantt-verbeteringen (#73–#74)
- Drag-drempel verhoogd van 5px naar 15px (minder per ongeluk verslepen)
- Discipline-volgorde stabiel tijdens deadline-drag (niveauberekening op originele deadline)

### Gantt lijnkleur (#76)
- Standaard lijnkleur donkerder (#6B7280)
- "Zwart bij selectie" verwijderd — niet-geselecteerde layers faden via opacity

### Gantt rendering herschreven (#77 → #78 → #80)
- Eerste poging: lijnen na blokjes renderen (werkte niet perfect)
- Tweede poging: layer per verslag (lijnen → blokjes → datumblokje per verslag)
- Definitieve oplossing: **drie-passes rendering**
  - Pass 1: alle verbindingslijnen (achtergrond, alle verslagen)
  - Pass 2: alle NOK-blokjes (geselecteerde verslag als laatste = bovenaan)
  - Pass 3: alle verslag-datumblokjes (altijd bovenop alles = altijd klikbaar)
- Direct switchen tussen verslagen zonder eerst te deselecteren ✅
- Lijnen van nieuwere verslagen liggen niet meer over NOK-blokjes van oudere verslagen ✅

### Projectpagina layout (#78)
- `items-start` op 2-kolommen grid → opmerkingen-kaart trekt niet meer mee omhoog

### Versienummering bijgewerkt (#75, #79, #81)
- Versie: 0.15.0 → 0.15.13 (9 PR's waren achtergebleven)

### Toegangsbeveiliging (#82)
- `middleware.ts`: blokkeert alle routes tenzij cookie `site-auth` klopt met `SITE_PASSWORD`
- `/toegang`: loginpagina met wachtwoordveld
- Cookie geldig 30 dagen
- Wachtwoord staat in `.env.local` (SITE_PASSWORD) én Vercel env vars

## ⚠️ Open probleem — TO DO volgende sessie

**HVAC-item per ongeluk verplaatst via drag:**
1. Zoek het oranje HVAC-NOK-punt in de database (deadline staat op een foute datum)
2. Herstel de deadline via Supabase dashboard of via een PATCH API-call
3. Daarna: drag-beveiliging verbeteren zodat dit niet meer kan (bv. drag-handle op blokje)

## Werkafspraak (nieuw)
- Eerst beschrijven wat Claude gaat doen, wachten op "ok", dan pas uitvoeren
- Aanpassingen kunnen gecombineerd worden in één PR

## Hoe verder op andere laptop
1. `git clone https://github.com/Nhutar/werfverslag-app-repo.git`
2. `cd werfverslag-app-repo`
3. `.env.local` aanmaken met alle credentials (zie Sessie Context MD)
4. `npm ci`
5. `claude` starten
6. Laad `WerfverslagApp_SessionContext.md` in de sessie
