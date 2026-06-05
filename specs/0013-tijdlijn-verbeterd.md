---
id: "0013"
title: Tijdlijn verbeterd — drag-to-pan, weekas, zoom
slug: tijdlijn-verbeterd
status: deployed
---

## Doel

De bestaande `TijdlijnSVG` vervangen door een verbeterde versie met:
- **Drag-to-pan**: horizontaal én verticaal slepen als een canvas (geen scrollbalk)
- **Week-gebaseerde as** als standaard: elke week heeft een vaste breedte
- **Instelbare zoom**: Week / 2 weken / Maand
- **Visuele opkuis**: minder leeg vertikal ruimte, blokjes vallen nooit buiten beeld,
  strakker en overzichtelijker geheel

De rest van de architectuur (TijdlijnSectie, TijdlijnSVG interface, ProjectTabbladen,
NokPuntenSectie) blijft ongewijzigd. Enkel de interne implementatie van TijdlijnSVG
wordt herschreven.

---

## Drag-to-pan

De tijdlijn wordt weergegeven in een **viewport-div** met vaste hoogte en
`overflow: hidden`. Binnenin staat de SVG op zijn volledige berekende grootte.
Via CSS `transform: translate(offsetX, offsetY)` wordt de inhoud verschoven.

### Gedrag

| Actie | Effect |
|---|---|
| Klik + slepen | Verschuift de SVG horizontaal én verticaal |
| Cursor | `grab` in rust, `grabbing` tijdens slepen |
| Loslaten muis buiten venster | Panning stopt (onMouseLeave + onMouseUp) |
| Klik zonder bewegen | Wordt als klik behandeld (opent modaal) |

De viewport-hoogte is vast: `480px`. De SVG-hoogte wordt berekend op basis van het
maximum aantal NOK-punten per verslag (tighter spacing dan voorheen).

### Begrenzing

De offset wordt begrensd zodat de SVG nooit verder dan zijn eigen rand verschoven
kan worden (geen lege ruimte buiten de SVG zichtbaar).

---

## Zoomniveaus

Een **zoom-selector** (dropdown of knoppen) bovenaan de tijdlijn laat de gebruiker
kiezen tussen drie weergavemodi:

| Zoomniveau | Label | Pixels per dag | Typische tijdspan |
|---|---|---|---|
| Week | `Week` | 14 px/dag | ~3 maanden zichtbaar |
| 2 weken | `2 weken` | 8 px/dag | ~6 maanden zichtbaar |
| Maand | `Maand` | 3 px/dag | ~18 maanden zichtbaar |

Standaard actief: **Week**.

Bij het wisselen van zoomniveau wordt de SVG herberekend. De offset wordt gereset
zodat de huidige datum (vandaag) zichtbaar blijft.

---

## Week-gebaseerde as

### Structuur van de X-as

- **Maandlabels** (bovenste rij): op de 1e van elke maand, grijs, klein
- **Weekmarkeringen** (onderste rij): elke maandag, lichte verticale lijn +
  korte datumnotatie ("2 jun", "9 jun", ...)
- De vandaag-lijn (blauw gestippeld) blijft behouden

### Weekmarkering bij "Maand"-zoom

Bij het "Maand"-zoomniveau zijn weken te smal om individueel te labelen.
In dat geval worden enkel **maandmarkeringen** getoond (geen weeklijntjes).

---

## Verticale layout — minder lege ruimte

### Aangepaste constanten

| Constante | Oud | Nieuw |
|---|---|---|
| LEVEL_H (ruimte per niveau) | 76 px | 55 px |
| Viewport hoogte | variabel | 480 px vast |
| TOP_PAD | 50 px | 36 px |
| BOTTOM_PAD | 55 px | 36 px |

### Blokjes nooit buiten beeld

De SVG-breedte wordt berekend inclusief een rechtermargin van minstens
`BLOKJE_W / 2 + 20 px` na de laatste deadline, zodat het rechtse blokje
altijd volledig zichtbaar is.

---

## Zoomknop UI

De zoomknoppen komen **rechtsboven in de tijdlijn-container**, naast de filters:

```
[Iedereen ▼] [Alle statussen ▼] [Alle disciplines ▼]    [Week] [2w] [Maand]
```

De actieve zoom krijgt een blauwe achtergrond (zelfde stijl als de bestaande
tabblad-knoppen).

---

## Wijzigingen

### Gewijzigde bestanden

- `components/TijdlijnSVG.tsx` — volledig herschreven (drag-to-pan, zoom, weekas,
  strakke layout)
- `components/TijdlijnSectie.tsx` — zoom-state toegevoegd, doorgegeven aan TijdlijnSVG;
  zoomknop-UI toegevoegd naast de filterbalk

### Ongewijzigd

- `components/ProjectTabbladen.tsx`
- `components/NokPuntenSectie.tsx`
- Alle API-routes, het datamodel, de pagina's

---

## Scope / buiten scope

**In scope:**
- Drag-to-pan (muis)
- Zoomniveaus (week / 2 weken / maand)
- Weekas met maandlabels
- Strakke verticale layout
- Blokjes nooit buiten beeld

**Buiten scope:**
- Touch/pinch-to-zoom (mobile)
- Slepen van blokjes om deadline te wijzigen
- Exporteren als afbeelding
