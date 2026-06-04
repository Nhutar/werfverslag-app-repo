---
kind: spec
id: "0009"
slug: projectlaag-dashboards
title: "Projectlaag: dashboards, projectdeelnemers en de omkering"
type: feature
status: queued
created: 2026-06-04
---

## Doel

Een **projectlaag** boven de werfverslagen invoeren. De hiërarchie wordt:

```
Hoofddashboard (/)  →  Project (/project/[id])  →  Werfverslag (/verslag/[id])  →  NOK-punten
```

Een project bundelt zijn werfverslagen, draagt het adres en de bouwheer, en bevat de vaste
lijst van **deelnemende verantwoordelijken**. Bij een werfverslag vink je aan wie aanwezig was
(de "omkering"), en een NOK-punt-verantwoordelijke kan elke projectdeelnemer zijn — ook
iemand die niet aanwezig was.

⚠️ **Grote spec met destructieve migratie.** De bestaande (test)werfverslagen, aanwezigen en
NOK-punten worden gewist (afgesproken met Eduardo). Schone start met de nieuwe structuur.

---

## A. Datamodel (Prisma)

### A1. Nieuw: Project
```prisma
model Project {
  id           String             @id @default(uuid())
  naam         String
  werfadres    String
  bouwheer     String?
  beschrijving String?
  aangemaaktOp DateTime           @default(now()) @map("aangemaakt_op")
  deelnemers   ProjectDeelnemer[]
  werfverslagen Werfverslag[]
  @@map("project")
}
```

### A2. Nieuw: ProjectDeelnemer (vaste lijst van verantwoordelijken)
```prisma
model ProjectDeelnemer {
  id         String   @id @default(uuid())
  projectId  String   @map("project_id")
  project    Project  @relation(fields: [projectId], references: [id])
  naam       String
  discipline String
  email      String
  aanwezigheden WerfverslagAanwezige[]
  @@map("project_deelnemer")
}
```

### A3. Werfverslag — aangepast
- **Verwijderd:** `naam` en `werfadres` (komen nu van het project).
- **Toegevoegd:** `projectId` (relatie naar Project).
- Behoudt: `verslaggever`, `datum`, `aangemaaktOp`, `nokPunten`, `magicLinkTokens`.
- `aanwezigen` wordt een many-to-many naar `ProjectDeelnemer` via een join.

### A4. Nieuw: WerfverslagAanwezige (wie was aanwezig)
```prisma
model WerfverslagAanwezige {
  id                 String           @id @default(uuid())
  werfverslagId      String           @map("werfverslag_id")
  werfverslag        Werfverslag      @relation(fields: [werfverslagId], references: [id])
  projectDeelnemerId String           @map("project_deelnemer_id")
  projectDeelnemer   ProjectDeelnemer @relation(fields: [projectDeelnemerId], references: [id])
  @@map("werfverslag_aanwezige")
}
```

### A5. Aanwezige (oud model) — verwijderd
- Het oude `Aanwezige` model (per verslag, met eigen naam/discipline/email) verdwijnt.

### A6. NOK-punt — ongewijzigd qua velden
- Behoudt `verantwoordelijkeNaam` + `verantwoordelijkeEmail` (gedenormaliseerd).
- Deze worden voortaan ingevuld vanuit de gekozen **ProjectDeelnemer**.

### A7. Migratie
- Destructief: verwijder bestaande rijen in `nok_punt`, `magic_link_token`, `aanwezige`,
  `werfverslag`. Drop het `aanwezige`-model. Voeg `project`, `project_deelnemer`,
  `werfverslag_aanwezige` toe; pas `werfverslag` aan (drop `naam`/`werfadres`, add `project_id`).
- Uitvoeren via `npx prisma migrate dev` (lege tabellen → geen data-conflict).

---

## B. Pagina's

### B1. Hoofddashboard (`/`) — vervangt het huidige verslagoverzicht
- Titel "Projecten" + knop **"+ Nieuw project"**.
- Eén kaart per project met: naam, werfadres, bouwheer (indien ingevuld),
  aantal werfverslagen, en statusbolletjes met het totaal aan open/dringende/opgeloste
  NOK-punten over alle werfverslagen van het project.
- ⋯-menu per projectkaart: **Aanpassen** / **Verwijderen** (cascade, met bevestiging).
- Lege staat: vriendelijke melding + "+ Nieuw project".

### B2. Nieuw project (`/project/nieuw`)
- Velden: **naam** (verplicht), **werfadres** (verplicht), **bouwheer** (optioneel),
  **beschrijving** (optioneel).
- Sectie **Deelnemende verantwoordelijken**: rijen met discipline (dropdown), naam, e-mail.
  Toevoegen/verwijderen zoals de huidige aanwezigen-invoer op `/nieuw`.
- Opslaan → `POST /api/projecten` → redirect naar `/project/[id]`.

### B3. Project aanpassen (`/project/[id]/aanpassen`)
- Zelfde formulier, vooringevuld. Deelnemers toevoegen/aanpassen/verwijderen.
- Opslaan → `PATCH /api/projecten/[id]`.

### B4. Projectdashboard (`/project/[id]`)
- Sticky kop: terug-link "← Terug naar projecten", projectkaart (naam, adres, bouwheer,
  beschrijving, lijst van deelnemende verantwoordelijken).
- Sectie **Werfverslagen** met knop **"+ Nieuw werfverslag"**.
- Eén kaart per werfverslag: datum, verslaggever, statusbolletjes van zijn NOK-punten.
  ⋯-menu: Aanpassen / Verwijderen.
- Lege staat als er nog geen werfverslagen zijn.

### B5. Nieuw werfverslag (`/project/[id]/verslag/nieuw`) — vervangt `/nieuw`
- Velden: **verslaggever** (verplicht), **datum** (verplicht).
- Sectie **Aanwezigen**: lijst met de projectdeelnemers, elk met een **checkbox**
  "aanwezig". Je vinkt aan wie aanwezig was (de omkering).
- Opslaan → `POST /api/projecten/[id]/werfverslagen` → redirect naar `/verslag/[id]`.

### B6. Werfverslag aanpassen — `/verslag/[id]/aanpassen` (bestaand, aangepast)
- Velden verslaggever + datum. Aanwezigen opnieuw aanvinken uit de projectdeelnemers.
- Geen naam/adres meer (die staan op het project).

---

## C. Werfverslag-detailpagina (`/verslag/[id]`) — aanpassingen

- Projectnaam wordt overal gebruikt waar vroeger `verslag.naam` stond
  (titel, e-mailtemplate "werf {projectnaam}").
- Terug-link: "← Terug naar project" → `/project/[projectId]`.
- De getoonde **aanwezigen** komen uit `WerfverslagAanwezige` (join naar ProjectDeelnemer).
  De inline ⋯-bewerking van aanwezigen vervalt hier; aanwezigheid beheer je via
  "werfverslag aanpassen".
- **NOK-punt verantwoordelijke**: de dropdown toont **alle projectdeelnemers**
  (niet enkel de aanwezigen). Naam + e-mail + discipline worden gekopieerd bij opslaan.
- Filteren/sorteren (uit spec 0007) blijft werken; de verantwoordelijke-lijst voor het filter
  komt uit de punten zoals nu.

---

## D. API-routes

| Methode | Route | Functie |
|---------|-------|---------|
| POST | `/api/projecten` | Project aanmaken (met deelnemers) |
| GET | `/api/projecten/[id]` | Project + deelnemers ophalen |
| PATCH | `/api/projecten/[id]` | Project + deelnemers aanpassen |
| DELETE | `/api/projecten/[id]` | Project verwijderen (cascade: werfverslagen, punten, foto's, tokens, deelnemers) |
| POST | `/api/projecten/[id]/werfverslagen` | Werfverslag aanmaken (verslaggever, datum, aangevinkte aanwezigen) |

Bestaande routes aanpassen:
- `GET/PATCH /api/verslagen/[id]`: geen naam/adres meer; aanwezigen = projectdeelnemers (id's).
- NOK-punt aanmaken/aanpassen: verantwoordelijke gekozen uit projectdeelnemers (via `projectDeelnemerId`),
  naam/e-mail/discipline gekopieerd.
- `PATCH /api/projecten/[id]` houdt de gedenormaliseerde naam/e-mail op NOK-punten in sync
  (bij wijziging van een deelnemer: update nok-punten van alle werfverslagen van dat project
  waar het oude e-mailadres matcht).
- Notificaties (`/api/verslagen/[id]/notificaties`): ontvangers nu uit de aanwezigen (modus
  "alle"/"specifiek") of uit de verantwoordelijken met openstaande punten. Dedup op e-mail blijft.

---

## E. Componenten

- Nieuw: `ProjectKaartLijst` (hoofddashboard), hergebruik `DrieKnopjesMenu` + `BevestigingDialog`.
- Nieuw/aangepast: projectformulier met deelnemers (lijkt op het huidige aanwezigen-formulier).
- Aangepast: werfverslag-aanmaakformulier met aanwezigheids-checkboxes.
- `NokPuntenSectie` / `BekijkNokPuntModaal`: verantwoordelijke-dropdown voedt zich nu met
  projectdeelnemers (doorgegeven vanuit de serverpagina).

---

## F. Navigatie-overzicht

- `/` Hoofddashboard (projecten)
- `/project/nieuw` Nieuw project
- `/project/[id]` Projectdashboard (werfverslagen)
- `/project/[id]/aanpassen` Project aanpassen
- `/project/[id]/verslag/nieuw` Nieuw werfverslag
- `/verslag/[id]` Werfverslag-detail (NOK-punten) — ongewijzigde URL
- `/verslag/[id]/aanpassen`, `/verslag/[id]/nieuw-punt`, `/verslag/[id]/punt/[nokPuntId]/aanpassen` — behouden
- `/afvinken/[token]` — behouden (redirect met `&modus=afvinken`)

---

## Buiten scope

- Echte authenticatie en rollen (bouwheer-login, bevoegdheden) → later product.
- Planning/Gantt per project → later (draft-002).
- Globaal adressenboek over projecten heen → later.
- Filteren/zoeken op het hoofddashboard → aparte latere spec (rest van draft-003).
- Timer/aanwezigheidsregistratie met tijdstip → later.
