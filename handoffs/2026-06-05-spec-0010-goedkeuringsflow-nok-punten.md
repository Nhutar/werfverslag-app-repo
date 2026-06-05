# Handoff — Spec 0010: Goedkeuringsflow NOK-punten (v0.10.0)

Gedeploy op 2026-06-05. CI groen.

## Wat gebouwd is

- Nieuwe status `wacht-op-goedkeuring` (blauw): wordt gezet wanneer een verantwoordelijke een punt afvinkt.
- Verslaggever ziet aanvaarden/afkeuren knoppen in het bekijk-modaal voor punten in deze status.
- Aanvaarden → status `opgelost` (groen).
- Afkeuren → status terug `open`, afkeuringsreden opgeslagen, e-mail naar verantwoordelijke met nieuwe magic link.
- Historiekweergave in het bekijk-modaal: ingediende oplossing + eventuele afkeuring.
- Statustellers, legende en filterdropdown uitgebreid met de nieuwe status.

## Nieuwe bestanden
- `app/api/nok-punten/[id]/aanvaarden/route.ts`
- `app/api/nok-punten/[id]/afkeuren/route.ts`
- `emails/AfkeuringEmail.tsx`
- `prisma/migrations/20260605082142_goedkeuringsflow_nok_punten/migration.sql`

## Datamodel
`NokPunt` heeft twee nieuwe optionele velden: `afkeuringsReden` en `afgekeurdOp`.
