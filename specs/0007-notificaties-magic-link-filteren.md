---
kind: spec
id: "0007"
slug: notificaties-magic-link-filteren
title: "Notificaties versturen, magic link en filteren/sorteren"
type: feature
status: queued
created: 2026-06-04
---

## Doel

De kernfeature van het prototype: een verslagmaker verstuurt e-mailnotificaties naar
verantwoordelijken. Elke verantwoordelijke krijgt een persoonlijke magic link die de
verslag-detailpagina opent, automatisch voorgefilterd op zijn naam. De NOK-puntenlijst
wordt filterbaar (verantwoordelijke, status, discipline) en sorteerbaar (urgentie/deadline).

---

## Onderdeel A — Filteren en sorteren (verslag-detailpagina)

### A1. Filterbalk boven de NOK-puntenlijst

Een compacte filterbalk (in de sticky kop) met:
- **Verantwoordelijke** — dropdown met "Iedereen" + de namen van alle verantwoordelijken op dit verslag.
- **Status** — dropdown met "Alle", "Open", "Bijna deadline", "Voorbij deadline", "Opgelost".
- **Discipline** — dropdown met "Alle" + de disciplines die effectief voorkomen op dit verslag.
- **Sorteren** — dropdown met "Urgentie" (standaard: voorbij-deadline → bijna → open → opgelost, daarbinnen vroegste deadline eerst) en "Toegevoegd (nieuwste eerst)".

### A2. Gedrag

- Filteren en sorteren gebeurt **client-side** in `NokPuntenLijst` (alle punten worden al meegestuurd).
- De opgeloste-sectie (inklapbaar) blijft werken; bij filter "Status = Opgelost" worden enkel opgeloste getoond.
- Als een filter geen resultaten geeft: vriendelijke melding "Geen NOK-punten voor deze filter."
- Een knop **"Filters wissen"** verschijnt zodra er een filter actief is.

### A3. Voorfilteren via URL

- De pagina leest een query-parameter `?verantwoordelijke=<email>`.
- Als die aanwezig is en overeenkomt met een verantwoordelijke op dit verslag, wordt de
  verantwoordelijke-filter automatisch ingesteld op die persoon (de gebruiker kan hem zelf weer wijzigen).

---

## Onderdeel B — Token-model aanpassen (per verantwoordelijke)

Het bestaande `MagicLinkToken` model (gekoppeld aan één NOK-punt) wordt herwerkt naar een
token per **verslag + verantwoordelijke**.

### B1. Nieuw schema voor MagicLinkToken

```prisma
model MagicLinkToken {
  id                      String      @id @default(uuid())
  token                   String      @unique
  werfverslagId           String      @map("werfverslag_id")
  werfverslag             Werfverslag @relation(fields: [werfverslagId], references: [id])
  verantwoordelijkeEmail  String      @map("verantwoordelijke_email")
  verantwoordelijkeNaam   String      @map("verantwoordelijke_naam")
  vervalOp                DateTime    @map("vervalt_op")
  aangemaaktOp            DateTime    @default(now()) @map("aangemaakt_op")

  @@map("magic_link_token")
}
```

- De relatie `NokPunt.magicLinkTokens` en de kolom `nok_punt_id` verdwijnen.
- `Werfverslag` krijgt de relatie `magicLinkTokens MagicLinkToken[]`.
- De tabel is leeg (er zijn nog geen tokens), dus de migratie mag de oude kolom droppen en de nieuwe toevoegen.

### B2. Cascade-verwijdering bijwerken

- In `DELETE /api/verslagen/[id]`: tokens verwijderen via `where: { werfverslagId }`.
- In `DELETE /api/nok-punten/[id]`: de regel die tokens per `nokPuntId` verwijderde **vervalt**
  (tokens hangen niet meer aan een punt).

### B3. Token-generatie

- Nieuwe helper `lib/tokens.ts`: `genereerToken()` → `crypto.randomUUID()` (Node stdlib).
- Vervaldatum: 30 dagen na aanmaak.

---

## Onderdeel C — Notificaties versturen (Resend + React Email)

### C1. Pakketten

- `resend` en `react-email` + `@react-email/components` toevoegen aan dependencies.
- Nieuwe helper `lib/resend.ts`: exporteert een `resend`-client op basis van `RESEND_API_KEY`.
- Van-adres: `Werfverslag App <onboarding@resend.dev>` (testadres, geen eigen domein nodig).

### C2. Knop en keuzemodaal

- Knop **"Verstuur notificaties"** op de verslag-detailpagina (in de sticky kop, naast "+ NOK-punt").
- Klikken opent een modaal met drie verzendmodi (radio-keuze):
  1. **Alle aanwezigen** — iedereen die als aanwezige op het verslag staat.
  2. **Enkel verantwoordelijken met openstaande punten** — wie minstens één niet-opgelost punt heeft.
  3. **Specifieke personen** — lijst met selecteerbare aanwezigen (checkboxes).
- Onder de keuze: knop **"Verstuur"** met laadstatus, en een resultaatmelding
  ("X e-mails verstuurd" of foutmelding).

### C3. API: POST /api/verslagen/[id]/notificaties

- Body: `{ modus: "alle" | "openstaand" | "specifiek", emails?: string[] }`.
- Bepaalt de ontvangerslijst op basis van de modus:
  - `alle`: alle aanwezigen van het verslag.
  - `openstaand`: aanwezigen die verantwoordelijke zijn voor ≥1 niet-opgelost NOK-punt (match op e-mail).
  - `specifiek`: enkel de meegegeven `emails` (moeten aanwezigen van dit verslag zijn).
- Voor elke ontvanger:
  1. Genereer een `MagicLinkToken` (verslag + email + naam, vervalt over 30 dagen).
  2. Bouw de link: `${NEXT_PUBLIC_BASE_URL}/afvinken/${token}`.
  3. Verzamel de openstaande NOK-punten van die persoon (titel + deadline) voor in de mail.
  4. Verstuur via Resend met de React Email template.
- Antwoord: `{ verstuurd: number }` of foutmelding.

### C4. E-mail template (`emails/NotificatieEmail.tsx`)

React Email template met:
- Kop: "Werfverslag — {werfnaam}".
- Begroeting met de naam van de verantwoordelijke.
- Korte tekst: "Er zijn NOK-punten waarvoor jij verantwoordelijk bent op werf {werfnaam}."
- Lijst van de openstaande punten van die persoon (titel + deadline). Als de persoon geen
  openstaande punten heeft (modus "alle"): tekst "Je bent op de hoogte gebracht van het werfverslag."
- Grote knop **"Bekijk en vink af"** → de magic link.
- Voettekst: "Je hoeft geen account aan te maken. Deze link is 30 dagen geldig."

---

## Onderdeel D — Magic link pagina (`/afvinken/[token]`)

De bestaande placeholderpagina wordt vervangen door een **redirect**:

- Zoek het token op. Ongeldig of verlopen → toon een nette foutpagina
  ("Link niet meer geldig. Neem contact op met de verslagmaker.").
- Geldig → `redirect()` naar `/verslag/${werfverslagId}?verantwoordelijke=${encodeURIComponent(email)}`.
- Zo komt de verantwoordelijke op de standaard verslagpagina, voorgefilterd op zijn naam,
  en kan hij via "Bekijk" → "Markeer als opgelost" zijn punten afvinken (bestaande functionaliteit uit Spec 0006).

---

## CI

- In `.github/workflows/tests.yml` een placeholder env var `RESEND_API_KEY: placeholder_resend_key`
  toevoegen, zodat de build niet faalt op een ontbrekende variabele.
- E-mails worden enkel bij runtime verstuurd, niet tijdens de build.

---

## Buiten scope

- Eigen geverifieerd e-maildomein (blijft `onboarding@resend.dev` in het prototype).
- Naam van de verantwoordelijke automatisch invullen in het "Markeer als opgelost" modaal
  (de redirect via query-parameter behoudt enkel de filter, niet de identiteit) → latere verfijning.
- Herinneringsmails / automatische opvolging.
- Verantwoordelijken die geen aanwezige zijn (vooraf aangewezen projectdeelnemers) → BuildHub (draft-002).
- E-mail-openrapportage of leesbevestiging.
