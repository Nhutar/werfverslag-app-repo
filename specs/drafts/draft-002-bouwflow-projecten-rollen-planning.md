---
kind: draft
id: "002"
slug: bouwflow-projecten-rollen-planning
title: "BuildHub (werknaam): projecten, rollen, dashboards en planning"
type: feature
status: draft
created: 2026-06-03
---

## Idee

De volledige **BuildHub**-app (werknaam, voorheen BouwFlow) werkt rond **projecten** die op de desktop worden aangemaakt.
Bij elk project worden verantwoordelijken en de bouwheer toegevoegd, met hun specifieke bevoegdheden.

Op de werf opent de verslagmaker een nieuw werfverslag vanuit het **projectspecifiek dashboard** — alle projectdata (naam, adres, enz.) wordt automatisch ingevuld. De verslagmaker duidt aan wie er aanwezig is op de rondgang. De datum wordt automatisch ingevuld. Er is optioneel een **timer** die de duur van de rondgang bijhoudt.

Per project is er een **Gantt-chart** die de planning en voortgang van werfverslagen en NOK-punten visualiseert.

Bij het aanmaken van een NOK-punt kiest de verslagmaker de verantwoordelijke uit een **globaal adressenboek** (over projecten heen), zodat gegevens niet telkens opnieuw ingetypt moeten worden.

De magic link pagina voor de verantwoordelijke is een **dynamisch onderdeel van het volledige werfverslag** — niet een losstaande pagina.

Per NOK-punt kunnen **meerdere foto's** worden toegevoegd.

### Omkering aanwezigen/verantwoordelijken (vs. prototype)

In het prototype kiezen we de verantwoordelijke van een NOK-punt uit de lijst van aanwezigen.
In de volledige app draait dit om:
- **Verantwoordelijken** worden vooraf ingegeven in het projectdashboard (zoals we nu aanwezigen ingeven bij een verslag).
- **Aanwezigen** worden bij een rondgang aangevinkt vanuit die verantwoordelijkenlijst (zoals we nu de verantwoordelijke kiezen op een NOK-punt).
- Een verantwoordelijke hoeft dus niet aanwezig te zijn op de rondgang.

### Schermen die hierbij horen
- **Overkoepelend dashboard** — overzicht van alle projecten
- **Projectdashboard** — verslagen, NOK-punten, aanwezigen, Gantt per project
- **Nieuw verslag (werf)** — prefilled vanuit projectdata, aanwezigen toevoegen, timer
- **Beheer rollen** — verantwoordelijken + bouwheer toevoegen per project, bevoegdheden toekennen
- **Globaal adressenboek** — contacten beheren over projecten heen
- **Volledig werfverslag** — met ingebedde magic link sectie per NOK-punt

## Open vragen

- Wat zijn de exacte bevoegdheden per rol? (Wie mag wat zien/doen?)
- Is de bouwheer een passieve ontvanger (leesrecht) of actief gebruiker?
- Hoe werkt de timer precies — enkel registreren, of ook rapporteren?
- Gantt op basis van deadlines van NOK-punten, of aparte planningstool?
- Meerdere verslagmakers per project?
- Definitieve naam: BuildHub, BouwFlow, of iets anders?

## Buiten scope

- Dit is voor de volledige BuildHub-app na het prototype (na ~3 maanden)
- Het prototype test alleen de kernhypothese: magic link afvinken zonder account
- Geen accounts, rollen, projecten of globaal adressenboek in het prototype
