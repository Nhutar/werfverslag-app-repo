---
spec: "post-0015 UI-verbeteringen"
date: 2026-06-08
version: 0.15.9
prs: "#66 – #74"
---
# UI-verbeteringen en Gantt fixes (v0.15.1 → v0.15.9)

## Wat er landde

**NOK-kaarten en modals (#66)**
- Klik op kaart = bekijk-modaal (ook in verantwoordelijke modus)
- ✏️ en 🗑️ icoontjes vervangen ··· menu op NOK-, verslag- en projectkaarten
- Opmerkingen: verwijderknop bij hover, "meer lezen" voor lange tekst (>160 tekens)
- Klik op modal-backdrop sluit de modal

**Hoofddashboard (#66)**
- Zoekbalk: naam, adres of bouwheer
- Filter: alle / met open punten / voorbij deadline / volledig opgelost

**Gantt tijdlijn (#70–#74)**
- Volledig scherm knop (↗), altijd zichtbaar
- Zoom: 7d / Maand / Alles op basis van containerbreedte; muiswiel voor in/uitzoomen richting cursor
- Klik op verslag = selecteer (andere transparant), tweede klik = modaal
- Klik op NOK-blokje selecteert bijhorend verslag + opent NOK-modaal
- Verbindingslijnen zwart bij geselecteerd verslag, donkerder grijs als standaard
- Discipline-label op elk blokje
- Drag-drempel verhoogd naar 15px (minder per ongeluk verslepen)
- Discipline-volgorde stabiel tijdens deadline-drag

**Vercel / TypeScript fixes (#67–#69)**
- `prisma generate` toegevoegd aan build script
- Expliciete types voor `.map()` callbacks (Vercel strict mode)

## Opmerkingen voor de volgende sessie
- Demo-project "Nieuwbouwwoning Lindelei" staat live op Vercel met 78 NOK-punten
- Versienummering was 9 PRs achtergebleven — rechttgezet in deze handoff (0.15.0 → 0.15.9)
- Volgende stap: mobile responsiveness (geparkeerd als volgende prioriteit)
