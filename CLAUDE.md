# CLAUDE.md — projectconventies (automatisch geladen elke sessie)

## Project
**werfverslag-app** — een dynamisch werfverslag met opvolgingslus voor de bouwsector.
Verslagmaker maakt NOK-punten → verantwoordelijke krijgt e-mail met magic link → vinkt af → verslagmaker ziet status updaten.

**Huidige versie:** 0.15.13
**Live app:** https://werfverslag-app-repo.vercel.app (wachtwoord vereist — zie Vercel env vars)

## Werkafspraak
Beschrijf eerst wat je gaat doen, wacht op "ok" van Eduardo, dan pas uitvoeren.
Zo kunnen aanpassingen gecombineerd worden voor ze uitgevoerd worden.

## Spec workflow
- /draft-spec  — parkeer een idee als specs/drafts/draft-NNN-<slug>.md
- /promote-spec <id> — promoveer een draft naar een queued development spec specs/NNNN-<slug>.md
- /queue-spec  — zet het huidige gesprek direct om naar een queued development spec
- /build-next  — bouw de volgende queued spec van begin tot eind (branch → PR → admin squash-merge → watch green → handoff)

Een development spec bevat GEEN open vragen. Drafts mogen dat wel.

## Versioning + CHANGELOG
Elke gemergde PR bumpt de versie en voegt een gedateerde CHANGELOG.md sectie toe.
Type → bump: breaking→MAJOR, new-feature→MINOR, bug/refactoring/test→PATCH.
Versie staat in package.json. NIET ophopen — elke PR direct bijwerken.

## Branching
- main is de bron van waarheid; nooit feature-werk rechtstreeks naar main committen
- Één spec = één branch = één PR = één squash-merge
- Na mergen: WACHT tot CI groen is op main voor de volgende spec

## Tech stack
- Framework: Next.js 14 (App Router)
- Taal: TypeScript
- UI: Tailwind CSS (clean, Monday.com-stijl, accent blauw #2563EB)
- Database: Supabase (PostgreSQL) via Prisma 7
- E-mail: Resend + React Email
- Bestandsopslag: Supabase Storage (bucket: nok-fotos, publiek)
- Hosting: Vercel (auto-deploy op merge naar main)
- Token generatie: Node.js crypto (stdlib)

## Commando's
```bash
npm ci                              # installeer dependencies
npm run build                       # bouw het project (= de CI test)
npm run dev                         # start lokale development server (via cmd, niet PowerShell)
npx prisma migrate dev --name naam  # voer database migraties uit
npx prisma generate                 # genereer Prisma client
```

⚠️ Start de app via **cmd**, niet PowerShell — PowerShell blokkeert npm-scripts.
⚠️ `gh` staat NIET in PATH: gebruik `& "C:\Program Files\GitHub CLI\gh.exe"`

## Omgevingsvariabelen (.env.local — nooit in git)
- DATABASE_URL: Supabase PostgreSQL connection string (pooled, poort 6543)
- DIRECT_URL: Supabase directe PostgreSQL URL (voor migraties, poort 5432)
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
- SUPABASE_SECRET_KEY: Supabase service role key
- RESEND_API_KEY: Resend API key
- NEXT_PUBLIC_BASE_URL: publieke URL (http://localhost:3000 lokaal)
- SITE_PASSWORD: wachtwoord voor toegangsbeveiliging

## Mappenstructuur
```
specs/              # development specifications (NNNN-<slug>.md)
specs/drafts/       # draft specifications (draft-NNN-<slug>.md)
handoffs/           # korte notities na elke bouwcyclus
app/                # Next.js App Router pagina's en API routes
app/toegang/        # loginpagina (wachtwoordbeveiliging)
components/         # React componenten (o.a. TijdlijnSVG.tsx)
lib/                # gedeelde utilities (prisma, supabase, resend, tokens, status, disciplines)
emails/             # React Email templates
prisma/             # Prisma schema en migraties
middleware.ts       # toegangsbeveiliging — blokkeert routes zonder geldig wachtwoord-cookie
scripts/            # seed scripts (seed-adressenboek.mjs, seed-demo-project.mjs)
```

## Gantt tijdlijn (TijdlijnSVG.tsx) — architectuur
Drie-passes rendering (BELANGRIJK — niet wijzigen zonder begrip):
1. **Pass 1** — alle verbindingslijnen (achtergrond, alle verslagen)
2. **Pass 2** — alle NOK-blokjes (geselecteerde verslag als laatste = bovenaan)
3. **Pass 3** — alle verslag-datumblokjes (altijd bovenop alles = altijd klikbaar)

Verslagen gesorteerd: oudste eerst, geselecteerde verslag als laatste in passes 2 en 3.
Niveau-berekening gebruikt originele deadline (niet visuele/sleep-deadline) voor stabiele layout.

## ⚠️ Open TO DO
1. **HVAC-item deadline herstellen** — een oranje HVAC-NOK-punt is per ongeluk via drag verplaatst. Deadline staat op een foute datum in de database. Herstellen via Supabase dashboard of PATCH API.
2. **Drag-beveiliging verbeteren** — 15px drempel is nog te laag. Bespreek met Eduardo: drag-handle op blokje of andere aanpak.

## Belangrijke valkuilen
- **Dev-server + build botsen:** NOOIT `npm run build` terwijl `npm run dev` loopt
- **Prisma 7:** connection-URLs in `prisma.config.ts`, niet in schema
- **Vercel TypeScript:** strenger dan lokaal — expliciete types vereist voor `.map()` callbacks
- **Vercel build:** `prisma generate` moet vóór `next build` — staat in package.json
- **Gantt muiswiel:** non-passive event listener vereist (`{ passive: false }`)
- **Tailwind dynamische klassen:** safelist nodig in tailwind.config voor klassen uit lib/
- **Resend:** gooit geen exception bij fouten — check altijd het `error`-veld
- **Supabase bucket:** nok-fotos moet Public staan
