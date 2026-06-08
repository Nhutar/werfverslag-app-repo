# Changelog

Versienummers volgen Semantic Versioning.
Type → bump: breaking→MAJOR, new-feature→MINOR, bug/refactoring/test→PATCH.

## [Unreleased]

## [0.15.12] — 2026-06-08

### Changed
- Gantt: layer-gebaseerde rendering — elk werfverslag vormt een eigen SVG-layer (lijnen → blokjes → datumblokje). Oudste verslag achteraan, geselecteerde verslag vooraan. Niet-geselecteerde layers faden naar opacity 0.12 (#78)
- Projectpagina: `items-start` op 2-kolommen grid zodat de opmerkingen-kaart niet mee omhoog trekt bij een lange deelnemerslijst (#78)

### Fixed
- Gantt: verbindingslijnen niet meer zichtbaar over NOK-blokjes door layer-structuur (#78)
- Gantt: verbindingslijnen altijd donkergrijs, transparant bij andere selectie (#76)
- Gantt: verbindingslijnen werden bedekt door witte achtergrond van andere NOK-blokjes (#77)

## [0.15.9] — 2026-06-08

### Fixed
- Gantt: discipline-volgorde blijft stabiel tijdens deadline-drag (niveauberekening op originele deadline) (#74)
- Gantt: drag-drempel verhoogd van 5px naar 15px — voorkomt per ongeluk verslepen bij klik (#73)
- Gantt: standaard verbindingslijnen donkerder (#9CA3AF i.p.v. #D1D5DB) zodat ze altijd zichtbaar zijn (#73)
- TypeScript type errors op adressenboekpagina gefixed voor Vercel strict build (#67, #68, #69)
- `prisma generate` toegevoegd aan Vercel build script (#69)
- Aanvaardingsdatum correct getoond in historiek van NOK-punt (#66)

### Changed
- Gantt: muiswiel zoom richting muispositie, containerbreedte bepaalt standaard zoom (#72)
- Gantt: volledig scherm modus (↗ knop), 7d/Maand/Alles zoomknoppen, weekas (#70, #71)
- Gantt: klik op verslag = selecteer, tweede klik = modaal; NOK-klik selecteert bijhorend verslag (#72)
- Gantt: verbindingslijnen zwart bij geselecteerd verslag, discipline-label op elk blokje (#72)
- NOK-kaarten: ✏️ en 🗑️ icoontjes vervangen ··· menu; klik op kaart opent bekijk-modaal (#66)
- Werfverslag- en projectkaarten: ✏️ en 🗑️ icoontjes; klik op backdrop sluit modals (#66)
- Opmerkingen: verwijderknop (hover), "meer lezen" voor lange tekst, DELETE API (#66)
- Hoofddashboard: zoekbalk (naam/adres/bouwheer) + filter (open/deadline/opgelost) (#66)

## [0.15.0] — 2026-06-05

### Added
- Opmerkingen-paneel per project en per werfverslag (scrollbaar, tekst + foto)
- Chat per NOK-punt in het bekijk-modaal (collapsible "Berichten" sectie)
- E-mail notificatie bij nieuw chatbericht op NOK-punt (naar verantwoordelijke)
- Naam automatisch ingevuld via magic link bij opgelost markeren + chatberichten
- Layout herwerking: project- en verslagpagina breder (max-w-6xl), 2 kolommen bovenaan
- Nieuw datamodel Opmerking + migratie

## [0.14.0] — 2026-06-05

### Added
- Gantt: NOK-blokje horizontaal slepen = deadline wijzigen (enkel verslaggever)
- Datum-tooltip boven blokje tijdens slepen
- Blauwe rand op actief sleepblokje
- Minimum deadline = verslagdatum (kan niet eerder gesleept worden)
- Foutmelding bij mislukte API-update + automatisch terug naar originele positie

## [0.13.0] — 2026-06-05

### Changed
- Tijdlijn volledig herschreven: drag-to-pan (horizontaal + verticaal, geen scrollbalk)
- Instelbare zoom: Week (14px/dag) / 2 weken (8px/dag) / Maand (3px/dag)
- Week-gebaseerde as met maandlabels en weekmarkeringen
- Strakke verticale layout: minder lege ruimte, blokjes nooit buiten beeld
- Subtiele schaduw op NOK-blokjes, afwisselende maandkleuring op achtergrond
- Zoomknoppen rechtsboven naast de filterbalk

## [0.12.0] — 2026-06-05

### Added
- Tijdlijn (Gantt) per project: tabblad "Tijdlijn" op de projectpagina met alle verslagen + NOK-punten
- Tijdlijn per werfverslag: tabblad "Tijdlijn" op de werfverslagpagina
- SVG-visualisatie: werfverslagen als knooppunten op een hoofdlijn, NOK-punten als klikbare blokjes op hun deadline-datum
- Haakse verbindingslijnen van verslag naar NOK-punt, gespreide verticale niveaus om overlap te vermijden
- Vandaag-lijn (blauw, gestippeld) + maandmarkeringen
- Filtering op verantwoordelijke, status en discipline in de tijdlijn
- Klikken op NOK-blokje opent het bestaande bekijk-modaal
- Startdatum werf: nieuw optioneel veld op project (formulier + API)

## [0.11.0] — 2026-06-05

### Added
- Adressenboek: gedeeld overzicht van professionele contactpersonen (/adressenboek)
- CRUD voor contacten: nieuw aanmaken, aanpassen, verwijderen
- Automatisch opslaan van nieuwe projectdeelnemers in het adressenboek (op e-mail)
- Zoeken en selecteren van bestaande contacten bij toevoegen aan project
- Synchronisatie: wijzigingen in adressenboek propageren naar projectdeelnemers en NOK-punten
- Bouwheer contactvelden uitgebreid (bedrijf, adres, e-mail, telefoon) op projectniveau
- Link naar adressenboek op het hoofddashboard

## [0.10.0] — 2026-06-05

### Added
- Goedkeuringsflow voor NOK-punten: na afvinken gaat een punt naar status "Wacht op goedkeuring" (blauw)
- Verslaggever kan oplossing aanvaarden (punt wordt definitief groen) of afkeuren met verplichte reden
- Bij afkeuring ontvangt de verantwoordelijke automatisch een e-mail met de reden en een nieuwe magic link
- Historiekweergave in het bekijk-modaal: ingediende oplossing + eventuele afkeuring worden getoond
- Nieuwe status "Wacht op goedkeuring" in statusbadges, tellers, legende en filterdropdown

## [0.9.2] — 2026-06-04

### Fixed
- Statuskleuren werden niet weergegeven (grijs): Tailwind scant nu ook `lib/` + safelist voor de statuskleuren
- Verantwoordelijke-modus: "← Terug naar project" verborgen, zodat een verantwoordelijke via de magic link opgesloten blijft op zijn werfverslag (geen uitweg naar projecten waar hij zou kunnen bewerken)

## [0.9.1] — 2026-06-04

### Changed
- Statustellers op project- en werfverslagkaarten tonen nu altijd alle 4 de kleuren met aantal (gedimd bij 0), met uitleg-tooltip
- Statuskleuren-legende toegevoegd onderaan het hoofddashboard en projectdashboard (duidelijk, ook op mobiel)
- Nieuwe componenten: StatusTellers, StatusLegende

## [0.9.0] — 2026-06-04

### Added
- Spec 0009: Projectlaag — nieuwe hiërarchie Hoofddashboard → Project → Werfverslag → NOK-punten
- Hoofddashboard (`/`) toont projecten met statusoverzicht
- Project aanmaken/aanpassen/verwijderen met deelnemende verantwoordelijken (`/project/nieuw`, `/project/[id]/aanpassen`)
- Projectdashboard (`/project/[id]`) met werfverslagen en projectinfo
- Werfverslag aanmaken onder een project met aanwezigheids-checkboxes (de "omkering")
- NOK-punt-verantwoordelijke kiesbaar uit alle projectdeelnemers (ook niet-aanwezigen)
- API: `/api/projecten`, `/api/projecten/[id]`, `/api/projecten/[id]/werfverslagen`
- Componenten: ProjectKaartLijst, ProjectFormulier, WerfverslagKaartLijst, WerfverslagFormulier

### Changed
- Werfadres en projectnaam staan nu op projectniveau (niet meer per werfverslag)
- Werfverslag = verslaggever + datum, hoort bij een project
- Notificaties en e-mail gebruiken nu de projectnaam
- NOK-punt-routes lezen de verantwoordelijke uit projectdeelnemers

### Removed
- Oud `Aanwezige`-model (vervangen door WerfverslagAanwezige join naar ProjectDeelnemer)
- Oude `/nieuw` pagina en `/api/verslagen` POST + `/api/aanwezigen` routes
- AanwezigenBeheer en oude VerslagKaartLijst componenten

### Database
- Destructieve migratie: bestaande testverslagen gewist; project/project_deelnemer/werfverslag_aanwezige toegevoegd

## [0.8.0] — 2026-06-04

### Added
- Spec 0008: Verantwoordelijke-modus via magic link (kijk-en-afvink)
- Magic link opent de verslagpagina met `&modus=afvinken`
- In deze modus verborgen: "+ NOK-punt", "Verstuur notificaties", aanpassen/verwijderen op punten en aanwezigen
- Behouden: filteren/sorteren, "Bekijk" en "Markeer als opgelost"
- Subtiele melding "Je bekijkt dit als verantwoordelijke"

### Changed
- Verslagmaker die zelf op verantwoordelijke filtert behoudt alle knoppen (modus enkel via magic link)

## [0.7.0] — 2026-06-04

### Added
- Spec 0007 ⭐ (kernfeature): E-mailnotificaties via Resend + React Email
- "Verstuur notificaties" knop met 3 modi: alle aanwezigen / openstaande punten / specifieke personen
- Magic link per verantwoordelijke → opent verslagpagina voorgefilterd op zijn naam
- Filteren op verantwoordelijke, status en discipline + sorteren op urgentie/toegevoegd
- E-mailtemplate met de openstaande NOK-punten van de ontvanger
- POST /api/verslagen/[id]/notificaties endpoint
- lib/tokens.ts en lib/resend.ts helpers

### Changed
- MagicLinkToken model: nu per verslag + verantwoordelijke (i.p.v. per NOK-punt)
- /afvinken/[token] is nu een redirect naar de voorgefilterde verslagpagina
- Verslag-detailpagina herwerkt met filterbalk in de sticky kop

### Removed
- Relatie NokPunt.magicLinkTokens (tokens hangen niet meer aan een individueel punt)

## [0.6.0] — 2026-06-04

### Added
- Spec 0006: Titel-veld op NOK-punt (verplicht, max 80 tekens)
- Omschrijving van NOK-punt is nu optioneel
- NOK-punt kaart toont enkel de titel (geen lange tekst meer)
- "Bekijk" optie in 3-puntjes menu van NOK-punt → modaal met alle details
- "Markeer als opgelost" knop in het bekijk-modaal met naam, omschrijving en foto van de oplossing
- POST /api/nok-punten/[id]/opgelost endpoint
- Database migratie: titel (verplicht) + omschrijving optioneel op nok_punt

## [0.5.0] — 2026-06-04

### Added
- Spec 0005: 3-puntjes menu (⋯) op werfverslag-kaarten, aanwezigen en NOK-punten
- Werfverslag aanpassen: nieuwe pagina `/verslag/[id]/aanpassen` (naam, verslaggever, datum, werfadres)
- Aanwezige aanpassen: modaal op de detailpagina (naam, discipline, e-mail)
- NOK-punt aanpassen: nieuwe pagina `/verslag/[id]/punt/[nokPuntId]/aanpassen` (omschrijving, verantwoordelijke, deadline, foto's)
- Foto's aanpassen: bestaande foto's individueel verwijderen, nieuwe toevoegen (tot max 5)
- Verwijderen met bevestigingsdialoog op alle drie plaatsen
- Extra waarschuwing bij verwijderen van verslag met NOK-punten
- Cascade verwijdering: foto's, tokens en punten worden mee verwijderd
- Herbruikbare componenten: DrieKnopjesMenu, BevestigingDialog, VerslagKaartLijst, AanwezigenBeheer
- API routes: PATCH + DELETE voor verslagen, aanwezigen en NOK-punten

## [0.4.1] — 2026-06-04

### Changed
- Discipline-veld verwijderd uit het NOK-punt formulier; discipline wordt automatisch overgenomen van de gekozen verantwoordelijke
- Nieuwste NOK-punten verschijnen bovenaan de lijst (nieuwste eerst)
- Onderste "+ NOK-punt toevoegen" knop verwijderd

## [0.4.0] — 2026-06-04

### Added
- Spec 0004: NOK-punt formulier functioneel — opslaan in database via POST /api/verslagen/[id]/nok-punten
- Foto-upload naar Supabase Storage (max 5 foto's, camera op mobiel + bestandskiezer)
- Foto-thumbnails zichtbaar op de verslag-detailpagina per NOK-punt
- Verantwoordelijke kiezen uit aanwezigen, e-mailadres wordt automatisch getoond
- GET /api/verslagen/[id] endpoint voor het formulier

### Changed
- NokPunt.fotoUrl (enkelvoud) vervangen door NokPunt.fotoUrls (array, max 5)
- Nieuw-punt pagina omgebouwd van Server Component naar Client Component

## [0.3.1] — 2026-06-03

### Changed
- Onderste "+ NOK-punt toevoegen" knop verschijnt enkel als er al NOK-punten zijn (geen dubbele knop bij lege lijst)

## [0.3.0] — 2026-06-03

### Added
- Spec 0003: Verslaggever-veld (naam) toegevoegd aan verslag, getoond op detailpagina
- Opgeloste NOK-punten in aparte inklapbare sectie "Opgelost (X)" onderaan
- Tweede "+ NOK-punt toevoegen" knop onderaan het kader

### Changed
- Aanwezigen verschijnen nu bovenaan de lijst (knop blijft bereikbaar)
- Verslagdetails sticky bovenaan op desktop, compact op mobiel
- Terug-navigatie benoemt het doeltype: "Terug naar werfverslagen" / "Terug naar project"
- NOK-punt pagina: werfnaam als titel, "NOK-punt toevoegen" als subtitel
- NOK-punten lijst toont nieuwste onderaan (volgorde van toevoegen)

## [0.2.0] — 2026-06-03

### Added
- Spec 0002: Alle 5 pagina's gebouwd met clean Monday.com-stijl UI
- Pagina 1: Overzicht verslagen met statusindicatoren per verslag
- Pagina 2: Nieuw verslag aanmaken met aanwezigenlijst (discipline + naam + e-mail)
- Pagina 3: Verslag detail met gesorteerde NOK-puntenlijst en statusbadges
- Pagina 4: NOK-punt toevoegen (UI klaar, opslaan komt in Spec 0003)
- Pagina 5: Magic link afvinken (UI klaar, logica komt in Spec 0005)
- lib/disciplines.ts: vaste disciplinelijst (13 + Andere)
- lib/status.ts: statusindicatoren met 7-dagenregel voor bijna-deadline
- components/StatusBadge.tsx: herbruikbaar statusbadge component
- Database uitgebreid: werfadres, aanwezige-tabel, oplossing-velden op nok_punt
- Prisma 7 adapter-pg geconfigureerd voor runtime databaseverbinding

## [0.0.1] — 2026-06-02

### Added
- Initieel project skelet aangemaakt.