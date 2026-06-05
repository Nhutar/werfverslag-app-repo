# Handoff — Spec 0013: Tijdlijn verbeterd (v0.13.0)

Gedeploy op 2026-06-05. CI groen.

## Wat veranderd is

- `TijdlijnSVG.tsx` volledig herschreven:
  - Drag-to-pan: muis slepen verschuift de SVG horizontaal + verticaal (geen scrollbalk)
  - Zoom-prop: "week" (14px/dag), "2weken" (8px/dag), "maand" (3px/dag)
  - Weekas met maandlabels bovenaan + weekmarkeringen onderaan
  - Afwisselende maandkleuring op achtergrond
  - Strakke layout: LEVEL_H verlaagd van 76 naar 55px, vaste viewport hoogte 480px
  - Subtiele schaduw op NOK-blokjes
  - Blokjes vallen nooit buiten rechterrand
- `TijdlijnSectie.tsx`: zoom-state + knoppen toegevoegd naast filterbalk
