---
kind: spec
id: "0002"
slug: frontend-paginas-navigatie-ui
title: "Frontend: pagina's, navigatie en UI"
type: feature
status: deployed
created: 2026-06-03
---

## Doel

De vijf pagina's van het prototype bouwen met een clean, professionele UI (referentie: Monday.com).
Mobile-first. Wit/lichtgrijs achtergrond, duidelijke kaartjes, kleur alleen waar het betekenis heeft.

---

## Kleurenpalet

| Rol | Kleur | Hex |
|-----|-------|-----|
| Accentkleur (knoppen, links) | Blauw | `#2563EB` |
| Open NOK-punt | Geel | `#EAB308` |
| Bijna deadline (< 7 dagen) | Oranje | `#F97316` |
| Voorbij deadline | Rood | `#EF4444` |
| Opgelost | Groen | `#22C55E` |
| Achtergrond | Lichtgrijs | `#F9FAFB` |
| Kaartjes | Wit | `#FFFFFF` |
| Primaire tekst | Antraciet | `#111827` |
| Secundaire tekst | Grijs | `#6B7280` |

---

## Disciplinelijst (vaste keuzelijst)

1. Ruwbouw
2. Dak
3. Buitenschrijnwerk
4. Binnenschrijnwerk
5. Gyproc / Plafond
6. Bepleistering
7. Vloerwerken
8. Schilderwerken
9. Elektriciteit
10. HVAC
11. Ventilatie
12. Sanitair
13. Verlichting
14. Andere (vrij tekstveld)

---

## Statussen van een NOK-punt

De status wordt automatisch berekend op basis van deadline en of het punt afgevinkt is:

| Status | Logica |
|--------|--------|
| Open | Niet opgelost + deadline > 7 dagen |
| Bijna deadline | Niet opgelost + deadline ≤ 7 dagen |
| Voorbij deadline | Niet opgelost + deadline verstreken |
| Opgelost | Afgevinkt door verantwoordelijke |

---

## Pagina's

### Pagina 1 — Overzicht verslagen (`/`)

**Doel:** startpagina, overzicht van alle werfverslagen.

**Inhoud:**
- Paginatitel: "Werfverslagen"
- Knop rechtsboven: "+ Nieuw verslag" (blauw)
- Lijst van verslagkaartjes, gesorteerd op datum (nieuwste eerst)

**Per verslagkaartje:**
- Naam van de werf (groot, vetgedrukt)
- Datum van de rondgang
- Werfadres (klein, grijs)
- Statusindicatoren: X 🟡 / X 🟠 / X 🔴 / X 🟢 (aantal per status)
- Klikbaar → navigeert naar Pagina 3

**Leeg scherm (geen verslagen):** vriendelijke melding + knop om eerste verslag aan te maken.

---

### Pagina 2 — Nieuw verslag aanmaken (`/nieuw`)

**Doel:** een nieuw werfverslag opstarten.

**Formuliervelden:**
1. **Naam werf** — verplicht tekstveld
2. **Datum** — datumkiezer, standaard vandaag, aanpasbaar
3. **Werfadres** — verplicht tekstveld
4. **Aanwezigen** — lijst van aanwezigen op de rondgang (zie hieronder)

**Aanwezigen — hoe werkt het:**
- Knop "+ Aanwezige toevoegen"
- Per aanwezige: discipline kiezen (keuzelijst 12 + Andere), naam (tekstveld), e-mailadres (tekstveld)
- Meerdere aanwezigen mogelijk
- Aanwezigen kunnen verwijderd worden (× knop)

**Actieknoppen:**
- "Verslag aanmaken" (blauw) → slaat op en navigeert naar Pagina 3
- "Annuleren" (grijs, tekst) → terug naar Pagina 1

**Validatie:**
- Naam werf en werfadres zijn verplicht
- Per aanwezige zijn naam en e-mailadres verplicht als de rij is toegevoegd

---

### Pagina 3 — Verslag detail (`/verslag/[id]`)

**Doel:** overzicht van één werfverslag met alle NOK-punten.

**Inhoud:**
- Naam werf (groot, vetgedrukt)
- Datum + werfadres (grijs)
- Aanwezigen: kommalijst van namen
- Knop "+ NOK-punt toevoegen" (blauw)
- Lijst van NOK-punten

**Per NOK-punt in de lijst:**
- Gekleurde statusbadge (geel/oranje/rood/groen)
- Discipline (klein label)
- Omschrijving (vetgedrukt)
- Verantwoordelijke naam
- Deadline

**Sortering:** open punten eerst (rood → oranje → geel), opgeloste punten onderaan.

**Leeg scherm (geen punten):** vriendelijke melding + knop om eerste NOK-punt toe te voegen.

---

### Pagina 4 — NOK-punt toevoegen (`/verslag/[id]/nieuw-punt`)

**Doel:** een nieuw NOK-punt aanmaken en de verantwoordelijke automatisch e-mailen.

**Formuliervelden:**
1. **Discipline** — keuzelijst (13 opties + Andere met vrij tekstveld)
2. **Omschrijving** — verplicht tekstveld (meerdere regels)
3. **Foto's** — knop "Foto toevoegen" opent camera, meerdere foto's mogelijk, thumbnails worden getoond
4. **Verantwoordelijke** — dropdown van aanwezigen van dit verslag (naam + discipline als label), e-mailadres wordt automatisch ingevuld en getoond (enkel lezen)
5. **Deadline** — verplicht, datumkiezer

**Actieknoppen:**
- "Opslaan en e-mail versturen" (blauw) → slaat op, stuurt mail, terug naar Pagina 3
- "Annuleren" (grijs, tekst) → terug naar Pagina 3 zonder opslaan

**Validatie:**
- Omschrijving, verantwoordelijke en deadline zijn verplicht

**Na opslaan:** korte bevestigingsmelding "NOK-punt aangemaakt, e-mail verstuurd naar [naam]."

---

### Pagina 5 — Magic link pagina (`/afvinken/[token]`)

**Doel:** verantwoordelijke vinkt het NOK-punt af via de link in zijn e-mail. Geen login vereist.

**Inhoud:**
- App-logo / naam bovenaan
- Naam werf + datum van het verslag
- Discipline + omschrijving van het NOK-punt
- Foto('s) indien aanwezig
- Deadline
- Grote knop "Ik heb dit opgelost" (blauw, volle breedte)

**Na klikken op de knop verschijnt een kort formulier:**
- Tekstveld: "Omschrijving van de oplossing" (optioneel, meerdere regels)
- Knop "Foto toevoegen" (optioneel, camera of galerij)
- Knop "Bevestigen" (blauw) → slaat op en toont bevestiging

**Na bevestigen:**
- Formulier verdwijnt
- Bevestigingsbericht: "Bedankt! Dit punt is gemarkeerd als opgelost."
- Datum en tijdstip van afvinken worden getoond
- Omschrijving en foto van de oplossing worden getoond indien ingevuld

**Ongeldige of verlopen token:**
- Vriendelijke foutmelding: "Deze link is niet meer geldig."

---

## Navigatie

- Geen sidebar of menu nodig in het prototype
- Terug-navigatie via een "← Terug" link bovenaan elke pagina (behalve Pagina 1)
- De magic link pagina (Pagina 5) heeft geen navigatie — het is een op zichzelf staande pagina

---

## Technische notities

- Alle pagina's zijn Next.js App Router pagina's (in `/app`)
- UI componenten via shadcn/ui + Tailwind CSS
- Statussen worden berekend in een utility functie in `lib/status.ts`
- Foto-upload via Supabase Storage bucket `nok-fotos`
- De aanwezigen worden opgeslagen in een nieuwe tabel `aanwezige` (toe te voegen aan schema in Spec 0003)
- E-mail versturen via Resend (Spec 0004)
- Magic link logica (Spec 0005)

---

## Buiten scope voor deze spec

- Foto-upload (Spec 0003)
- E-mail versturen (Spec 0004)
- Magic link afvinken (Spec 0005)
- In Spec 0002 worden de pagina's gebouwd met correcte structuur en UI, maar knoppen die afhangen van e-mail of magic links tonen een placeholder
