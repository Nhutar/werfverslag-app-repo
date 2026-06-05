# Handoff — Spec 0015: Opmerkingen, chat & layout (v0.15.0)

Gedeploy op 2026-06-05. CI groen.

## Wat gebouwd is

- Model `Opmerking` (projectId/werfverslagId/nokPuntId, auteurNaam, auteurRol, tekst, fotoUrls)
- `GET/POST /api/opmerkingen` met foto-upload via Supabase Storage
- `OpmerkingPaneel` component: scrollbaar paneel met berichten + invoer (tekst + foto)
- Chat in `BekijkNokPuntModaal`: collapsible "Berichten" sectie onderaan
- E-mail bij nieuw chatbericht op NOK-punt (naar verantwoordelijke, via Resend)
- Auto-naam via magic link: naam vooringevuld in opgelost-formulier + chat
- Layout: project- en verslagpagina breder (`max-w-6xl`), 2 kolommen bovenaan (info links, opmerkingen rechts), Gantt/NOK-lijst volle breedte onderaan
- `kopInhoud` prop in NokPuntenSectie is nu optioneel

## Nieuwe bestanden
- `app/api/opmerkingen/route.ts`
- `components/OpmerkingPaneel.tsx`
- `emails/NieuwBerichtEmail.tsx`
- `prisma/migrations/20260605210441_opmerkingen/migration.sql`
