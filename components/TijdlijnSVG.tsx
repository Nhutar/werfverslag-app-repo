"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TijdlijnNokItem {
  id: string;
  titel: string;
  deadline: string; // ISO date
  status: string;
}

export interface TijdlijnVerslagItem {
  id: string;
  datum: string; // ISO date
  nokPunten: TijdlijnNokItem[];
}

interface Props {
  verslagen: TijdlijnVerslagItem[];
  startdatum?: string | null;
  projectNaam: string;
  onBekijkNok: (nokId: string) => void;
}

// ─── Layout constants ─────────────────────────────────────────────────────────

const PX_PER_DAG = 52;
const LEVEL_H = 76;
const BLOKJE_W = 136;
const BLOKJE_H = 34;
const BLOKJE_R = 6;
const LINKS_MARGE = 24;
const RECHTS_MARGE = 72;
const TOP_PAD = 48;   // ruimte boven voor maandlabels
const BOTTOM_PAD = 52; // ruimte onder voor verslaglabels
const VERSLAG_W = 90;
const VERSLAG_H = 26;
const VERSLAG_R = 5;
const DOT_R = 5;

// ─── Status kleuren ───────────────────────────────────────────────────────────

const STATUS_KLEUR: Record<string, string> = {
  "open": "#FBBF24",
  "bijna-deadline": "#F97316",
  "voorbij-deadline": "#EF4444",
  "wacht-op-goedkeuring": "#3B82F6",
  "opgelost": "#22C55E",
};

function statusKleur(status: string): string {
  return STATUS_KLEUR[status] ?? "#9CA3AF";
}

// ─── Datumhulpfuncties ────────────────────────────────────────────────────────

function parseDate(iso: string): Date {
  // Zet ISO date-only string om naar local midnight
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dagVerschil(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDatum(d: Date): string {
  return d.toLocaleDateString("nl-BE", { day: "numeric", month: "short" });
}

function formatMaand(d: Date): string {
  return d.toLocaleDateString("nl-BE", { month: "short", year: "2-digit" });
}

function truncate(tekst: string, max: number): string {
  return tekst.length > max ? tekst.slice(0, max - 1) + "…" : tekst;
}

// ─── Hoofdcomponent ───────────────────────────────────────────────────────────

export function TijdlijnSVG({ verslagen, startdatum, projectNaam, onBekijkNok }: Props) {
  if (verslagen.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        Nog geen werfverslagen om te tonen.
      </div>
    );
  }

  // ── Tijdsbereik bepalen ──────────────────────────────────────────────────

  const alleDatums: Date[] = [];
  for (const v of verslagen) {
    alleDatums.push(parseDate(v.datum));
    for (const n of v.nokPunten) alleDatums.push(parseDate(n.deadline));
  }

  const vroegste = alleDatums.reduce((a, b) => (a < b ? a : b));
  const laatste = alleDatums.reduce((a, b) => (a > b ? a : b));

  // Startpunt: startdatum van project OF 7 dagen vóór vroegste datum
  let beginDatum: Date;
  if (startdatum) {
    beginDatum = parseDate(startdatum);
  } else {
    beginDatum = new Date(vroegste);
    beginDatum.setDate(beginDatum.getDate() - 7);
  }

  // Eindpunt: 21 dagen na laatste deadline
  const eindDatum = new Date(laatste);
  eindDatum.setDate(eindDatum.getDate() + 21);

  const totaleDagen = dagVerschil(beginDatum, eindDatum);

  function dateToX(d: Date): number {
    return LINKS_MARGE + dagVerschil(beginDatum, d) * PX_PER_DAG;
  }

  // ── Niveaus berekenen ────────────────────────────────────────────────────

  // Per verslag: wijs niveaus toe aan NOK-punten (afwisselend boven/onder)
  type NokMetNiveau = TijdlijnNokItem & { verslagX: number; nokCenterY: number };
  const nokMetNiveaus: NokMetNiveau[] = [];

  let maxAbove = 0;
  let maxBelow = 0;

  for (const verslag of verslagen) {
    const nA = Math.ceil(verslag.nokPunten.length / 2);
    const nB = Math.floor(verslag.nokPunten.length / 2);
    if (nA > maxAbove) maxAbove = nA;
    if (nB > maxBelow) maxBelow = nB;
  }

  const mainLineY = TOP_PAD + maxAbove * LEVEL_H;
  const svgHoogte = mainLineY + maxBelow * LEVEL_H + BOTTOM_PAD;
  const svgBreedte = LINKS_MARGE + totaleDagen * PX_PER_DAG + RECHTS_MARGE;

  for (const verslag of verslagen) {
    const verslagX = dateToX(parseDate(verslag.datum));
    verslag.nokPunten.forEach((nok, i) => {
      const levelNum = Math.floor(i / 2) + 1;
      const richting = i % 2 === 0 ? -1 : 1; // even = boven, oneven = onder
      const nokCenterY = mainLineY + richting * levelNum * LEVEL_H;
      nokMetNiveaus.push({ ...nok, verslagX, nokCenterY });
    });
  }

  // ── Vandaag ──────────────────────────────────────────────────────────────

  const vandaag = new Date();
  vandaag.setHours(0, 0, 0, 0);
  const vandaagX = dateToX(vandaag);
  const vandaagZichtbaar = vandaagX > LINKS_MARGE && vandaagX < svgBreedte - RECHTS_MARGE;

  // ── Maandmarkeringen ─────────────────────────────────────────────────────

  const maandMarkers: { x: number; label: string }[] = [];
  const cur = new Date(beginDatum.getFullYear(), beginDatum.getMonth(), 1);
  while (cur <= eindDatum) {
    const x = dateToX(cur);
    if (x >= LINKS_MARGE) {
      maandMarkers.push({ x, label: formatMaand(cur) });
    }
    cur.setMonth(cur.getMonth() + 1);
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-x-auto w-full rounded-xl border border-gray-200 bg-white">
      <svg
        width={svgBreedte}
        height={svgHoogte}
        style={{ display: "block", minWidth: svgBreedte }}
      >
        {/* Achtergrond */}
        <rect width={svgBreedte} height={svgHoogte} fill="white" />

        {/* Maandmarkeringen */}
        {maandMarkers.map(({ x, label }, i) => (
          <g key={i}>
            <line x1={x} y1={TOP_PAD / 2} x2={x} y2={svgHoogte - BOTTOM_PAD / 2}
              stroke="#F3F4F6" strokeWidth={1} />
            <text x={x + 4} y={16} fontSize={10} fill="#9CA3AF" fontFamily="sans-serif">
              {label}
            </text>
          </g>
        ))}

        {/* Vandaag-lijn */}
        {vandaagZichtbaar && (
          <g>
            <line
              x1={vandaagX} y1={TOP_PAD / 2}
              x2={vandaagX} y2={svgHoogte - BOTTOM_PAD / 4}
              stroke="#3B82F6" strokeWidth={1.5}
              strokeDasharray="4 3"
            />
            <rect x={vandaagX - 22} y={2} width={44} height={16} rx={4} fill="#3B82F6" />
            <text x={vandaagX} y={13} fontSize={9} fill="white" textAnchor="middle"
              fontFamily="sans-serif" fontWeight="bold">
              Vandaag
            </text>
          </g>
        )}

        {/* Hoofdlijn */}
        <line
          x1={LINKS_MARGE - 10} y1={mainLineY}
          x2={svgBreedte - RECHTS_MARGE + 12} y2={mainLineY}
          stroke="#374151" strokeWidth={2}
        />
        {/* Pijlpunt */}
        <polygon
          points={`${svgBreedte - RECHTS_MARGE + 20},${mainLineY} ${svgBreedte - RECHTS_MARGE + 10},${mainLineY - 5} ${svgBreedte - RECHTS_MARGE + 10},${mainLineY + 5}`}
          fill="#374151"
        />

        {/* Projectnaamlabel */}
        <text
          x={LINKS_MARGE - 8} y={mainLineY - 8}
          fontSize={10} fill="#6B7280" fontFamily="sans-serif"
          textAnchor="start"
        >
          {truncate(projectNaam, 18)}
        </text>

        {/* ── Verbindingslijnen (eerst, achter blokjes) ── */}
        {nokMetNiveaus.map((nok) => {
          const deadlineX = dateToX(parseDate(nok.deadline));
          const blokjeLinks = deadlineX - BLOKJE_W / 2;
          return (
            <path
              key={`lijn-${nok.id}`}
              d={`M ${nok.verslagX},${mainLineY} L ${nok.verslagX},${nok.nokCenterY} L ${blokjeLinks},${nok.nokCenterY}`}
              fill="none"
              stroke="#D1D5DB"
              strokeWidth={1.5}
            />
          );
        })}

        {/* ── Werfverslagen ── */}
        {verslagen.map((verslag) => {
          const x = dateToX(parseDate(verslag.datum));
          return (
            <g key={verslag.id}>
              <rect
                x={x - VERSLAG_W / 2}
                y={mainLineY - VERSLAG_H / 2}
                width={VERSLAG_W}
                height={VERSLAG_H}
                rx={VERSLAG_R}
                fill="white"
                stroke="#374151"
                strokeWidth={1.5}
              />
              <text
                x={x}
                y={mainLineY + 1}
                fontSize={9}
                fill="#111827"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {formatDatum(parseDate(verslag.datum))}
              </text>
              {/* Datum label eronder */}
              <text
                x={x}
                y={mainLineY + VERSLAG_H / 2 + 14}
                fontSize={9}
                fill="#9CA3AF"
                textAnchor="middle"
                fontFamily="sans-serif"
              >
                verslag
              </text>
            </g>
          );
        })}

        {/* ── NOK-punt blokjes ── */}
        {nokMetNiveaus.map((nok) => {
          const deadlineX = dateToX(parseDate(nok.deadline));
          const bx = deadlineX - BLOKJE_W / 2;
          const by = nok.nokCenterY - BLOKJE_H / 2;
          const kleur = statusKleur(nok.status);
          return (
            <g
              key={`blokje-${nok.id}`}
              style={{ cursor: "pointer" }}
              onClick={() => onBekijkNok(nok.id)}
            >
              <rect
                x={bx} y={by}
                width={BLOKJE_W} height={BLOKJE_H}
                rx={BLOKJE_R}
                fill="white"
                stroke="#E5E7EB"
                strokeWidth={1.5}
              />
              {/* Status dot */}
              <circle
                cx={bx + 12}
                cy={nok.nokCenterY}
                r={DOT_R}
                fill={kleur}
              />
              {/* Titel */}
              <text
                x={bx + 22}
                y={nok.nokCenterY + 1}
                fontSize={10}
                fill="#111827"
                dominantBaseline="middle"
                fontFamily="sans-serif"
              >
                {truncate(nok.titel, 14)}
              </text>
              {/* Onzichtbaar klik-overlay */}
              <rect
                x={bx} y={by}
                width={BLOKJE_W} height={BLOKJE_H}
                rx={BLOKJE_R}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
