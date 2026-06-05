---
id: "0011"
title: Adressenboek
slug: adressenboek
status: deployed
---

## Doel

Een gedeeld adressenboek van professionele contactpersonen die herbruikbaar zijn over
alle projecten heen. Projectdeelnemers zijn voortaan gekoppeld aan een adresboekcontact
— de bron van waarheid. Wijzigingen in het adressenboek propageren automatisch naar
alle gekoppelde projectdeelnemers en hun NOK-punten.

Bouwheren worden projectspecifiek opgeslagen (niet in het adressenboek) en krijgen
dezelfde contactvelden als een adresboekcontact.

---

## Datamodel

### Nieuw model: `AdresboekContact`

| Veld | Type | Verplicht | Beschrijving |
|---|---|---|---|
| `id` | `String` (uuid) | ja | Primaire sleutel |
| `naam` | `String` | ja | Naam contactpersoon |
| `bedrijf` | `String?` | nee | Bedrijfsnaam |
| `adres` | `String?` | nee | Adres (vrij tekstveld) |
| `discipline` | `String` | ja | Één discipline uit de vaste lijst |
| `email` | `String` | ja | E-mailadres (uniek) |
| `telefoon` | `String?` | nee | GSM of telefoon |
| `aangemaaktOp` | `DateTime` | ja | Aanmaakdatum |

`email` is uniek in het adressenboek — geen dubbele contacten op basis van e-mail.

### Wijzigingen aan `ProjectDeelnemer`

| Wijziging | Details |
|---|---|
| Nieuw veld `adresboekContactId` | Optionele koppeling naar `AdresboekContact` |
| Bestaande velden behouden | `naam`, `discipline`, `email` blijven aanwezig als gedenormaliseerde kopie |

De gedenormaliseerde velden (`naam`, `discipline`, `email`) blijven bewaard zodat
historische gegevens niet verloren gaan als een contact later wijzigt. Ze worden
gesynchroniseerd bij elke update van het adresboekcontact.

### Wijzigingen aan `Project`

Bouwheer krijgt aparte contactvelden naast het bestaande `bouwheer`-tekstveld:

| Veld | Type | Verplicht | Beschrijving |
|---|---|---|---|
| `bouwheerNaam` | `String?` | nee | Naam contactpersoon bouwheer |
| `bouwheerBedrijf` | `String?` | nee | Bedrijfsnaam bouwheer |
| `bouwheerAdres` | `String?` | nee | Adres bouwheer |
| `bouwheerEmail` | `String?` | nee | E-mail bouwheer |
| `bouwheerTelefoon` | `String?` | nee | GSM/telefoon bouwheer |

Het bestaande `bouwheer`-veld (vrij tekstveld) wordt hergebruikt als `bouwheerNaam`
zodat bestaande data bewaard blijft. In de UI wordt het vervangen door het volledig
contactformulier.

---

## Gedrag

### Adresboekcontact aanmaken via het adressenboek

Nieuwe pagina `/adressenboek/nieuw`: formulier met alle velden, opslaan in
`AdresboekContact`.

### Adresboekcontact aanmaken via een project (automatisch)

Wanneer een nieuwe projectdeelnemer wordt aangemaakt (naam + discipline + email):
1. Zoek in `AdresboekContact` op e-mail (hoofdletterongevoelig).
2. Gevonden → koppel de deelnemer aan het bestaande contact (geen duplicaat aanmaken).
3. Niet gevonden → maak automatisch een nieuw `AdresboekContact` aan met de
   ingevoerde naam, discipline en e-mail, en koppel de deelnemer eraan.

### Bestaand contact kiezen vanuit een project

Op de projectpagina (deelnemers toevoegen): zoekvenster op naam of e-mail in het
adressenboek. Gevonden contact selecteren → projectdeelnemer aanmaken gekoppeld aan
dat contact, velden vooringevuld.

### Synchronisatie adressenboek → projectdeelnemers

Wanneer een adresboekcontact wordt bijgewerkt (naam, discipline, email, telefoon,
bedrijf, adres):
- Alle `ProjectDeelnemer`-records gekoppeld aan dit contact worden bijgewerkt
  (`naam`, `discipline`, `email`).
- Alle `NokPunt`-records in de bijhorende projecten worden bijgewerkt
  (`verantwoordelijkeNaam`, `verantwoordelijkeEmail`) — dezelfde logica als vandaag
  bij het aanpassen van een `ProjectDeelnemer`.

### Bouwheer

Het projectformulier (`/project/nieuw` en `/project/[id]/aanpassen`) krijgt een
uitgebreid bouwheerblok met de vijf contactvelden. De velden zijn optioneel.
De bouwheer wordt **niet** opgeslagen in het adressenboek.

---

## Pagina's en routes

### Nieuwe pagina's

| Route | Beschrijving |
|---|---|
| `/adressenboek` | Overzicht van alle contacten, gesorteerd op naam, filterbaar op discipline |
| `/adressenboek/nieuw` | Formulier: nieuw contact aanmaken |
| `/adressenboek/[id]/aanpassen` | Formulier: bestaand contact bewerken |

### Nieuwe API-routes

| Methode | Route | Actie |
|---|---|---|
| `GET` | `/api/adressenboek` | Lijst van alle contacten |
| `POST` | `/api/adressenboek` | Nieuw contact aanmaken |
| `PATCH` | `/api/adressenboek/[id]` | Contact bijwerken (triggert sync) |
| `DELETE` | `/api/adressenboek/[id]` | Contact verwijderen (ontkoppelt deelnemers, verwijdert contact) |

### Gewijzigde pagina's

- `/project/[id]` — deelnemers toevoegen: keuze uit adressenboek + eventueel nieuw
- `/project/nieuw` en `/project/[id]/aanpassen` — bouwheer contactvelden uitbreiden

---

## UI-details

### Adressenboek overzichtspagina (`/adressenboek`)

- Toegankelijk via een link in het hoofddashboard (naast "Nieuw project")
- Lijst van contactkaarten: naam, bedrijf, discipline-badge, e-mail, telefoon
- Filterbaar op discipline (dropdown)
- Zoekbalk op naam of bedrijf
- Knop "+ Nieuw contact"
- Per contact: 3-puntjesmenu met "Aanpassen" en "Verwijderen"

### Deelnemer toevoegen aan project

Huidig formulier (naam + discipline + email) wordt vervangen door:
1. **Zoekbalk**: typ naam of e-mail → toont overeenkomsten uit het adressenboek
2. **Selecteer** een bestaand contact → velden worden ingevuld, deelnemer aangemaakt
3. **Of**: klik "Nieuw contact" → toon het volledige invulformulier → slaat op in
   adressenboek én voegt toe als deelnemer

---

## Migratie

- Bestaande `ProjectDeelnemer`-records behouden hun gegevens. `adresboekContactId`
  blijft `null` voor bestaande deelnemers (geen retroactieve koppeling nodig).
- Het bestaande `bouwheer`-tekstveld wordt hernoemd naar `bouwheerNaam` in de migratie.

---

## Scope / buiten scope

**In scope:**
- Model `AdresboekContact` + migratie
- CRUD-pagina's voor het adressenboek
- Automatisch opslaan bij nieuw aanmaken deelnemer
- Zoeken en selecteren uit adressenboek bij project
- Synchronisatie adresboek → deelnemers → NOK-punten
- Bouwheer contactvelden op project

**Buiten scope:**
- Meerdere disciplines per contact
- Gedeeld adressenboek over meerdere gebruikers/accounts
- Import/export van contacten
- Terugkoppeling van bouwheer naar adressenboek
