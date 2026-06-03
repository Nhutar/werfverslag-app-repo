---
kind: draft
id: "002"
slug: bouwflow-projecten-rollen-planning
title: "BouwFlow: projecten, rollen, dashboards en planning"
type: feature
status: draft
created: 2026-06-03
---

## Idee

De volledige BouwFlow-app werkt rond **projecten** die op de desktop worden aangemaakt.
Bij elk project worden verantwoordelijken en de bouwheer toegevoegd, met hun specifieke bevoegdheden.

Op de werf opent de verslagmaker een nieuw werfverslag vanuit het **projectspecifiek dashboard** — alle projectdata (naam, adres, enz.) wordt automatisch ingevuld. De verslagmaker duidt aan wie er aanwezig is op de rondgang. De datum wordt automatisch ingevuld. Er is optioneel een **timer** die de duur van de rondgang bijhoudt.

Per project is er een **Gantt-chart** die de planning en voortgang van werfverslagen en NOK-punten visualiseert.

### Schermen die hierbij horen
- **Overkoepelend dashboard** — overzicht van alle projecten
- **Projectdashboard** — verslagen, NOK-punten, aanwezigen, Gantt per project
- **Nieuw verslag (werf)** — prefilled vanuit projectdata, aanwezigen toevoegen, timer
- **Beheer rollen** — verantwoordelijken + bouwheer toevoegen per project, bevoegdheden toekennen

## Open vragen

- Wat zijn de exacte bevoegdheden per rol? (Wie mag wat zien/doen?)
- Is de bouwheer een passieve ontvanger (leesrecht) of actief gebruiker?
- Hoe werkt de timer precies — enkel registreren, of ook rapporteren?
- Gantt op basis van deadlines van NOK-punten, of aparte planningstool?
- Meerdere verslagmakers per project?

## Buiten scope

- Dit is voor de volledige BouwFlow-app na het prototype (na ~3 maanden)
- Het prototype test alleen de kernhypothese: magic link afvinken zonder account
- Geen accounts, rollen of projecten in het prototype
