# Handoff — Spec 0007: Notificaties, magic link en filteren ⭐

**Datum:** 2026-06-04
**Versie:** v0.7.0
**PR:** #33

## Wat is gebouwd (de kernfeature)

- **Resend + React Email** geïntegreerd (`lib/resend.ts`, `emails/NotificatieEmail.tsx`).
- **"Verstuur notificaties"** knop op de verslag-detailpagina met 3 modi:
  - Alle aanwezigen
  - Enkel verantwoordelijken met openstaande punten
  - Specifieke personen (checkboxes)
- **POST /api/verslagen/[id]/notificaties** — genereert per ontvanger een magic link token, verstuurt e-mail met de openstaande punten van die persoon.
- **Magic link** (`/afvinken/[token]`) → redirect naar `/verslag/[id]?verantwoordelijke=<email>`, voorgefilterd op de persoon.
- **Filteren** op verantwoordelijke, status, discipline + **sorteren** op urgentie/toegevoegd (`NokPuntenSectie`).
- Token-model herwerkt: per verslag + verantwoordelijke (i.p.v. per NOK-punt).

## Belangrijke aandachtspunten

- Van-adres: `onboarding@resend.dev` (Resend testadres). Mails komen mogelijk enkel toe bij het e-mailadres waarmee het Resend-account is aangemaakt, zolang er geen eigen geverifieerd domein is.
- `RESEND_API_KEY` staat in `.env.local` (en als placeholder in CI).
- `NEXT_PUBLIC_BASE_URL` bepaalt de magic link URL (lokaal: http://localhost:3000).

## Te testen door Eduardo

1. NOK-punt aanmaken met een verantwoordelijke (gebruik je eigen e-mail als test).
2. "Verstuur notificaties" → "openstaande punten" → Verstuur.
3. Mail checken, op de link klikken → verslagpagina voorgefilterd op die persoon.
4. "Bekijk" → "Markeer als opgelost".

## Volgende stappen (mogelijk)

- Naam vooraf invullen in het "Markeer als opgelost" modaal via de magic link.
- Eigen e-maildomein verifiëren in Resend (voor echte verzending naar iedereen).
- Sessiecontext-bestand updaten (WerfverslagApp_SessionContext.md is verouderd).
- Mobile + UX polish.
