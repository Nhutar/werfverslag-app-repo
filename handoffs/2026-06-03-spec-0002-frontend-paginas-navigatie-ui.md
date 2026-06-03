# Handoff — Spec 0002: Frontend pagina's, navigatie en UI

**Datum:** 2026-06-03
**Versie:** 0.2.0
**Status:** deployed ✅

## Wat is gebouwd

Alle 5 pagina's van het prototype zijn aangemaakt met een clean, Monday.com-geïnspireerde UI.

### Pagina's

| Route | Beschrijving | Status |
|-------|-------------|--------|
| `/` | Overzicht verslagen met statusindicatoren | Volledig werkend |
| `/nieuw` | Nieuw verslag aanmaken + aanwezigen | Volledig werkend |
| `/verslag/[id]` | Verslag detail + NOK-puntenlijst | Volledig werkend |
| `/verslag/[id]/nieuw-punt` | NOK-punt formulier | UI klaar, opslaan in Spec 0003 |
| `/afvinken/[token]` | Magic link afvinken | UI klaar, logica in Spec 0005 |

### Nieuwe bestanden

- `app/page.tsx` — overzicht verslagen (server component, Prisma)
- `app/nieuw/page.tsx` — nieuw verslag formulier (client component)
- `app/verslag/[id]/page.tsx` — verslag detail (server component, Prisma)
- `app/verslag/[id]/nieuw-punt/page.tsx` — NOK-punt UI (server component, Prisma)
- `app/afvinken/[token]/page.tsx` — magic link pagina (server component, Prisma)
- `app/api/verslagen/route.ts` — POST API om verslag + aanwezigen aan te maken
- `components/StatusBadge.tsx` — herbruikbaar statusbadge component
- `lib/disciplines.ts` — 13 disciplines + Andere
- `lib/status.ts` — statusindicatoren (7-dagenregel voor bijna-deadline)

### Database uitbreidingen

- `werfadres` toegevoegd aan `werfverslag`
- Nieuwe tabel `aanwezige` (discipline, naam, email, gekoppeld aan werfverslag)
- `oplossing_omschrijving` en `oplossing_foto_url` toegevoegd aan `nok_punt`

### Technische noot: Prisma 7 + adapter-pg

Prisma 7 vereist een database-adapter in plaats van URL in schema.prisma.
We gebruiken `@prisma/adapter-pg` met de `pg` package.
CI gebruikt een dummy DATABASE_URL zodat de build slaagt zonder echte DB.

## Bekende beperkingen

- Foto-upload nog niet geïmplementeerd (Spec 0003)
- NOK-punt opslaan nog niet geïmplementeerd (Spec 0003)
- E-mail versturen nog niet geïmplementeerd (Spec 0004)
- Magic link afvinken nog niet geïmplementeerd (Spec 0005)

## Volgende spec

**Spec 0003** — NOK-punt formulier + opslaan in database + foto-upload via Supabase Storage
