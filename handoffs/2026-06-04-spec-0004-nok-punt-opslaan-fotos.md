# Handoff — Spec 0004: NOK-punt opslaan + foto's

**Datum:** 2026-06-04
**Versie:** v0.4.0
**PR:** #20

## Wat is gebouwd

- Het NOK-punt formulier (`/verslag/[id]/nieuw-punt`) is volledig functioneel.
- Nieuwe API routes:
  - `GET /api/verslagen/[id]` — haalt verslaginfo + aanwezigen op (gebruikt door het formulier).
  - `POST /api/verslagen/[id]/nok-punten` — slaat NOK-punt op, inclusief foto-upload.
- Foto's worden geüpload naar Supabase Storage bucket `nok-fotos`, max 5 per punt.
- Op de verslag-detailpagina verschijnen kleine foto-thumbnails bij elk punt (max 3 zichtbaar, rest achter "+X").
- Verantwoordelijke gekozen uit aanwezigenlijst; e-mailadres automatisch getoond.
- Database migratie: `fotoUrl String?` → `fotoUrls String[]`.

## Volgende stap (Spec 0005)

- "Verstuur notificaties" knop op verslag-detailpagina.
- 1 e-mail per unieke verantwoordelijke met al zijn NOK-punten uit dat verslag.
- Resend integratie + React Email template.
- Magic link token genereren per NOK-punt (`crypto.randomUUID()`).
- `/afvinken/[token]` pagina functioneel maken (afvinken endpoint).
