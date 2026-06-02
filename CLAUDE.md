# CLAUDE.md — projectconventies (automatisch geladen elke sessie)

## Project
**werfverslag-app** — een dynamisch werfverslag met opvolgingslus voor de bouwsector.
Een verslagmaker maakt NOK-punten aan → verantwoordelijke krijgt e-mail met magic link → vinkt af → verslagmaker ziet status updaten.

## Spec workflow
- /draft-spec  — parkeer een idee als specs/drafts/draft-NNN-<slug>.md
- /promote-spec <id> — promoveer een draft naar een queued development spec specs/NNNN-<slug>.md
- /queue-spec  — zet het huidige gesprek direct om naar een queued development spec
- /build-next  — bouw de volgende queued spec van begin tot eind (branch → PR → admin squash-merge → watch green → handoff)

Een development spec bevat GEEN open vragen. Drafts mogen dat wel.

## Versioning + CHANGELOG
Elke gemergde PR bumpt de versie en voegt een gedateerde CHANGELOG.md sectie toe.
Type → bump: breaking→MAJOR, new-feature→MINOR, bug/refactoring/test→PATCH.
Versie staat in package.json.

## Branching
- main is de bron van waarheid; nooit feature-werk rechtstreeks naar main committen
- Één spec = één branch (spec/NNNN-<slug>) = één PR = één squash-merge
- Na mergen: WACHT tot CI groen is op main voor de volgende spec

## Tech stack
- Framework: Next.js 14 (App Router)
- Taal: TypeScript
- UI: shadcn/ui + Tailwind CSS
- Database: Supabase (PostgreSQL) via Prisma
- E-mail: Resend + React Email
- Bestandsopslag: Supabase Storage
- Hosting: Vercel (auto-deploy op merge naar main)
- Token generatie: Node.js crypto (stdlib)

## Commando's
```bash
npm ci                    # installeer dependencies
npm run build             # bouw het project (= de CI test)
npm run dev               # start lokale development server
npx prisma migrate dev    # voer database migraties uit
```

## Mappenstructuur
```
specs/              # development specifications (NNNN-<slug>.md)
specs/drafts/       # draft specifications (draft-NNN-<slug>.md)
src/                # applicatiecode (nog leeg)
tests/              # tests (nog leeg)
handoffs/           # korte notities na elke bouwcyclus
app/                # Next.js App Router pagina's en API routes
components/         # React componenten
lib/                # gedeelde utilities (prisma, supabase, resend, tokens)
emails/             # React Email templates
prisma/             # Prisma schema en migraties
```

## Omgevingsvariabelen (.env.local — nooit in git)
- DATABASE_URL: Supabase PostgreSQL connection string (pooled)
- DIRECT_URL: Supabase directe PostgreSQL URL (voor migraties)
- NEXT_PUBLIC_SUPABASE_URL: Supabase project URL
- SUPABASE_SERVICE_ROLE_KEY: Supabase service role key
- RESEND_API_KEY: Resend API key
- NEXT_PUBLIC_BASE_URL: publieke URL (http://localhost:3000 lokaal)

## Bouwplan (specs in volgorde)
- 0001: Database schema + Prisma migratie + Supabase Storage bucket
- 0002: Homepage + verslag aanmaken + verslag overzicht (leeg)
- 0003: NOK-punt formulier + opslaan in database
- 0004: Resend integratie + magic link e-mail bij aanmaken punt
- 0005 ⭐: Magic link pagina + afvinken endpoint + bevestiging (kernfeature)
- 0006: Verslag overzicht verfijnen (badges, foto's, sortering, statistieken)
- 0007: Mobile responsiveness + error states + UX polish
