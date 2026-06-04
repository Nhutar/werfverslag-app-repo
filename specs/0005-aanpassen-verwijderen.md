---
kind: spec
id: "0005"
slug: aanpassen-verwijderen
title: "Aanpassen en verwijderen via 3-puntjes menu"
type: feature
status: deployed
created: 2026-06-04
---

## Doel

Een 3-puntjes menu (⋯) toevoegen aan werfverslag-kaarten, aanwezigen en NOK-punt-kaarten.
Elk menu heeft twee opties: **Aanpassen** en **Verwijderen**.

---

## Aanpassingen

### 1. 3-puntjes menu — algemeen gedrag

- Rechtsboven in elk vakje: een kleine knop met **⋯** (drie puntjes).
- Klikken opent een klein dropdown-menu met: **Aanpassen** en **Verwijderen**.
- Klikken buiten het menu sluit het.
- Stijl: wit vakje, lichte schaduw, subtiele hover-markering per optie.

---

### 2. Werfverslag aanpassen

**Locatie menu:** op de werfverslag-kaart op de overzichtspagina (`/`).

**Aanpassen:**
- Navigeert naar `/verslag/[id]/aanpassen`.
- Zelfde lay-out als `/nieuw`, maar alle velden vooringevuld:
  naam, verslaggever, datum, werfadres.
- Opslaan → `PATCH /api/verslagen/[id]` → redirect naar `/`.

**Verwijderen:**
- Bevestigingsdialoog: "Ben je zeker dat je dit verslag wil verwijderen?"
- Extra waarschuwing als het verslag NOK-punten bevat:
  "Dit verslag bevat X NOK-punt(en). Alle punten en foto's worden ook verwijderd."
- Bij bevestiging: `DELETE /api/verslagen/[id]` → redirect naar `/`.
- Cascade: ook alle aanwezigen, NOK-punten, magic link tokens en foto's in Supabase Storage worden verwijderd.

---

### 3. Aanwezige aanpassen

**Locatie menu:** op elke aanwezige-rij op de verslag-detailpagina (`/verslag/[id]`).

**Aanpassen:**
- Opent een klein modaal (popup) met de velden: naam, discipline (dropdown), e-mail.
- Opslaan → `PATCH /api/aanwezigen/[aanwezigeId]` → pagina herlaadt de aanwezigenlijst.

**Verwijderen:**
- Bevestigingsdialoog: "Ben je zeker dat je deze aanwezige wil verwijderen?"
- Bij bevestiging: `DELETE /api/aanwezigen/[aanwezigeId]` → aanwezige verdwijnt uit de lijst.

---

### 4. NOK-punt aanpassen

**Locatie menu:** op elke NOK-punt-kaart op de verslag-detailpagina (`/verslag/[id]`).

**Aanpassen:**
- Navigeert naar `/verslag/[id]/punt/[nokPuntId]/aanpassen`.
- Zelfde lay-out als het formulier voor nieuw NOK-punt, maar vooringevuld:
  omschrijving, verantwoordelijke (dropdown aanwezigen), deadline.
- Foto's: bestaande foto's getoond als thumbnails met een ✕-knop om individueel te verwijderen.
  Nieuwe foto's toevoegen tot max 5 in totaal.
- Opslaan → `PATCH /api/nok-punten/[nokPuntId]` → redirect naar `/verslag/[id]`.

**Verwijderen:**
- Bevestigingsdialoog: "Ben je zeker dat je dit NOK-punt wil verwijderen?"
- Bij bevestiging: `DELETE /api/nok-punten/[nokPuntId]` → redirect naar `/verslag/[id]`.
- Cascade: ook de bijhorende foto's in Supabase Storage en magic link tokens worden verwijderd.

---

## API routes (nieuw)

| Methode | Route | Functie |
|---------|-------|---------|
| PATCH | `/api/verslagen/[id]` | Werfverslag aanpassen |
| DELETE | `/api/verslagen/[id]` | Werfverslag verwijderen (cascade) |
| PATCH | `/api/aanwezigen/[id]` | Aanwezige aanpassen |
| DELETE | `/api/aanwezigen/[id]` | Aanwezige verwijderen |
| PATCH | `/api/nok-punten/[id]` | NOK-punt aanpassen + foto's beheren |
| DELETE | `/api/nok-punten/[id]` | NOK-punt verwijderen (cascade) |

---

## Nieuwe pagina's

| Pagina | Doel |
|--------|------|
| `/verslag/[id]/aanpassen` | Werfverslag aanpassen |
| `/verslag/[id]/punt/[nokPuntId]/aanpassen` | NOK-punt aanpassen |

Aanwezige aanpassen gebeurt via een modaal op de detailpagina (geen aparte pagina).

---

## Buiten scope

- Aanpassen van een verslag terwijl het "afgesloten" is → niet van toepassing in prototype.
- Volgorde van aanwezigen wijzigen.
- Foto's herordenen bij NOK-punt aanpassen.
