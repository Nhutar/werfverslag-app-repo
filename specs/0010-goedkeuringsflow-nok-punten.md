---
id: "0010"
title: Goedkeuringsflow NOK-punten
slug: goedkeuringsflow-nok-punten
status: queued
---

## Doel

Wanneer een verantwoordelijke een NOK-punt als opgelost markeert, moet de verslaggever
de oplossing nog goedkeuren. De verslaggever kan het punt **aanvaarden** (permanent
sluiten) of **afkeuren** (terugzetten naar open met een afkeuringsreden). De volledige
historiek (originele NOK, oplossing, afkeuring) blijft zichtbaar op het punt.

---

## Datamodel — wijzigingen aan `NokPunt`

### Nieuwe velden

| Veld | Type | Verplicht | Beschrijving |
|---|---|---|---|
| `afkeuringsReden` | `String?` | nee | Tekst van de verslaggever bij afkeuring |
| `afgekeurdOp` | `DateTime?` | nee | Tijdstip van afkeuring |

### Status uitbreiding

De huidige 4 statussen worden uitgebreid met een 5e:

| Status | Kleur | Betekenis |
|---|---|---|
| `OPEN` | 🟡 geel | Nieuw, nog niet opgelost |
| `BIJNA_DEADLINE` | 🟠 oranje | ≤ 7 dagen voor deadline (automatisch) |
| `VOORBIJ_DEADLINE` | 🔴 rood | Deadline overschreden (automatisch) |
| `WACHT_OP_GOEDKEURING` | 🔵 blauw | Verantwoordelijke heeft afgevinkt, wacht op verslaggever |
| `OPGELOST` | 🟢 groen | Aanvaard door verslaggever, definitief gesloten |

De status `WACHT_OP_GOEDKEURING` vervangt de huidige tussenliggende toestand na afvinken.
Een punt dat al `OPGELOST` was vóór deze feature blijft `OPGELOST` (geen migratie nodig).

---

## Gedrag per rol

### Verantwoordelijke (via magic link — afvinkmodus)

- Ziet de knop **"Markeer als opgelost"** zoals vandaag.
- Na afvinken gaat de status naar `WACHT_OP_GOEDKEURING`.
- Verantwoordelijke ziet daarna de melding: _"Oplossing ingediend — wacht op goedkeuring van de verslaggever."_
- Kan een punt in `WACHT_OP_GOEDKEURING` niet opnieuw afvinken.

### Verslaggever (normale modus)

- Ziet punten in `WACHT_OP_GOEDKEURING` met een **blauwe badge** en twee knoppen:
  - **Aanvaarden** → status wordt `OPGELOST`, punt definitief gesloten.
  - **Afkeuren** → opent een invulveld voor de afkeuringsreden (verplicht), daarna:
    - Status gaat terug naar `OPEN`.
    - `afkeuringsReden` en `afgekeurdOp` worden opgeslagen.
    - De verantwoordelijke ontvangt een **automatische e-mail** met de afkeuringsreden
      en een nieuwe magic link om het punt opnieuw te bekijken en af te vinken.

---

## Historiekweergave op het NOK-punt (bekijk-modaal / detailweergave)

Het bekijk-modaal toont onderaan een **Historiek**-sectie met alle acties in volgorde:

1. **Originele NOK** — titel, omschrijving, foto's, deadline (altijd zichtbaar)
2. **Oplossing** — omschrijvingstekst + foto's die de verantwoordelijke heeft ingediend
   (velden `oplossingOmschrijving`, `oplossingFotoUrls`, `opgelostOp`)
3. **Afkeuring** *(indien van toepassing)* — afkeuringsreden + tijdstip (`afgekeurdOp`)

Als een punt meerdere rondes doorloopt (opgelost → afgekeurd → opnieuw opgelost),
worden de velden overschreven met de laatste waarden. De historiek toont dus steeds
de meest recente cyclus. Volledige versiehistoriek is buiten scope voor dit prototype.

---

## API-routes

| Methode | Route | Actie |
|---|---|---|
| `POST` | `/api/nok-punt/[id]/aanvaarden` | Status → `OPGELOST` |
| `POST` | `/api/nok-punt/[id]/afkeuren` | Status → `OPEN`, sla `afkeuringsReden` op, stuur mail |

Beide routes zijn enkel toegankelijk in normale modus (niet via magic link).

---

## E-mail bij afkeuring

- **Onderwerp:** `Oplossing afgekeurd — [titel van het NOK-punt]`
- **Inhoud:** naam van het punt, afkeuringsreden van de verslaggever, knop met nieuwe
  magic link naar het werfverslag.
- Zelfde opmaak als de bestaande notificatiemails (React Email, Resend).
- Er wordt een nieuwe `MagicLinkToken` aangemaakt voor deze verantwoordelijke
  (vervalt na 30 dagen, zelfde logica als vandaag).

---

## Statustellers op de werfverslagpagina

De 4 bolletjes worden uitgebreid naar 5:

🟡 Open · 🟠 Bijna deadline · 🔴 Voorbij deadline · 🔵 Wacht op goedkeuring · 🟢 Opgelost

De kleurenlegende onderaan de pagina wordt overeenkomstig bijgewerkt.

---

## Scope / buiten scope

**In scope:**
- Datamodelwijziging + migratie
- Statuslogica uitbreiden
- UI: blauwe badge + aanvaarden/afkeuren knoppen voor verslaggever
- UI: melding voor verantwoordelijke na afvinken
- Historiekweergave in bekijk-modaal
- API-routes aanvaarden + afkeuren
- E-mail bij afkeuring

**Buiten scope:**
- Volledige versiehistoriek over meerdere cycli
- Notificatie aan verslaggever bij nieuw ingediende oplossing (kan later)
- Goedkeuring delegeren aan anderen dan de verslaggever
