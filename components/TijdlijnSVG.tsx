"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TijdlijnNokItem {
  id: string;
  titel: string;
  deadline: string;
  status: string;
  verslagDatum: string; // minimum voor deadline-drag
}

export interface TijdlijnVerslagItem {
  id: string;
  datum: string;
  nokPunten: TijdlijnNokItem[];
}

export type ZoomNiveau = "week" | "2weken" | "maand";

interface Props {
  verslagen: TijdlijnVerslagItem[];
  startdatum?: string | null;
  projectNaam: string;
  zoom: ZoomNiveau;
  verslaggeVerModus?: boolean;
  onBekijkNok: (nokId: string) => void;
  onDeadlineWijzig?: (nokId: string, nieuweDeadline: string) => void;
}

// ─── Layout constanten ────────────────────────────────────────────────────────

const ZOOM_PX_PER_DAG: Record<ZoomNiveau, number> = {
  week: 14,
  "2weken": 8,
  maand: 3,
};

const LEVEL_H = 55;
const BLOKJE_W = 130;
const BLOKJE_H = 32;
const BLOKJE_R = 7;
const LINKS_MARGE = 16;
const RECHTS_MARGE = BLOKJE_W / 2 + 24;
const TOP_PAD = 36;
const BOTTOM_PAD = 36;
const VERSLAG_W = 84;
const VERSLAG_H = 24;
const VERSLAG_R = 5;
const DOT_R = 5;
const VIEWPORT_H = 480;

// ─── Status kleuren ───────────────────────────────────────────────────────────

const STATUS_KLEUR: Record<string, string> = {
  open: "#FBBF24",
  "bijna-deadline": "#F97316",
  "voorbij-deadline": "#EF4444",
  "wacht-op-goedkeuring": "#3B82F6",
  opgelost: "#22C55E",
};

function statusKleur(s: string): string {
  return STATUS_KLEUR[s] ?? "#9CA3AF";
}

// ─── Datumhulpfuncties ────────────────────────────────────────────────────────

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("T")[0].split("-").map(Number);
  return new Date(y, m - 1, d);
}

function dagVerschil(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function isoVanDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDagen(iso: string, dagen: number): string {
  const d = parseDate(iso);
  d.setDate(d.getDate() + dagen);
  return isoVanDate(d);
}

function formatDag(d: Date): string {
  return d.toLocaleDateString("nl-BE", { day: "numeric", month: "short" });
}

function formatMaand(d: Date): string {
  return d.toLocaleDateString("nl-BE", { month: "long", year: "numeric" });
}

function truncate(t: string, max: number): string {
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

function vorigeMaandag(d: Date): Date {
  const dag = new Date(d);
  const dow = dag.getDay();
  const diff = dow === 0 ? 6 : dow - 1;
  dag.setDate(dag.getDate() - diff);
  return dag;
}

// ─── Hoofdcomponent ───────────────────────────────────────────────────────────

export function TijdlijnSVG({
  verslagen,
  startdatum,
  projectNaam,
  zoom,
  verslaggeVerModus = false,
  onBekijkNok,
  onDeadlineWijzig,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Canvas-pan drag state
  const canvasDrag = useRef({
    active: false, startX: 0, startY: 0,
    startOffX: 0, startOffY: 0, moved: false,
  });

  // Blokje-drag state
  const blokjeDrag = useRef<{
    active: boolean;
    nokId: string;
    verslagDatum: string;
    startClientX: number;
    origineleDeadline: string;
  } | null>(null);

  const [sleepState, setSleepState] = useState<{
    nokId: string;
    deadline: string;
  } | null>(null);

  const [foutMelding, setFoutMelding] = useState<string | null>(null);

  const pxPerDag = ZOOM_PX_PER_DAG[zoom];

  // Tijdsbereik
  const heeftData = verslagen.length > 0;
  const alleDatums: Date[] = [];
  for (const v of verslagen) {
    alleDatums.push(parseDate(v.datum));
    for (const n of v.nokPunten) alleDatums.push(parseDate(n.deadline));
  }

  const vandaag = new Date();
  vandaag.setHours(0, 0, 0, 0);

  const vroegste = alleDatums.length > 0 ? alleDatums.reduce((a, b) => (a < b ? a : b)) : vandaag;
  const laatste = alleDatums.length > 0 ? alleDatums.reduce((a, b) => (a > b ? a : b)) : vandaag;

  let beginDatum: Date;
  if (startdatum) {
    beginDatum = parseDate(startdatum);
  } else {
    beginDatum = vorigeMaandag(new Date(vroegste));
    beginDatum.setDate(beginDatum.getDate() - 7);
  }
  const eindDatum = new Date(laatste);
  eindDatum.setDate(eindDatum.getDate() + 28);

  const totaleDagen = Math.max(1, dagVerschil(beginDatum, eindDatum));

  function dateToX(d: Date): number {
    return LINKS_MARGE + dagVerschil(beginDatum, d) * pxPerDag;
  }

  // Niveaus
  let maxAbove = 0;
  let maxBelow = 0;
  for (const v of verslagen) {
    const nA = Math.ceil(v.nokPunten.length / 2);
    const nB = Math.floor(v.nokPunten.length / 2);
    if (nA > maxAbove) maxAbove = nA;
    if (nB > maxBelow) maxBelow = nB;
  }

  const mainLineY = TOP_PAD + maxAbove * LEVEL_H;
  const svgHoogte = Math.max(VIEWPORT_H, mainLineY + maxBelow * LEVEL_H + BOTTOM_PAD);
  const svgBreedte = LINKS_MARGE + totaleDagen * pxPerDag + RECHTS_MARGE;

  type NokItem = TijdlijnNokItem & { verslagX: number; nokCenterY: number; visueleDeadline: string };
  const nokItems: NokItem[] = [];
  for (const v of verslagen) {
    const verslagX = dateToX(parseDate(v.datum));
    v.nokPunten.forEach((nok, i) => {
      const levelNum = Math.floor(i / 2) + 1;
      const richting = i % 2 === 0 ? -1 : 1;
      const visueleDeadline = (sleepState?.nokId === nok.id) ? sleepState.deadline : nok.deadline;
      nokItems.push({ ...nok, verslagX, nokCenterY: mainLineY + richting * levelNum * LEVEL_H, visueleDeadline });
    });
  }

  const vandaagX = dateToX(vandaag);
  const vandaagZichtbaar = vandaagX > LINKS_MARGE - 1 && vandaagX < svgBreedte - RECHTS_MARGE + BLOKJE_W / 2;

  // As-markeringen
  const maandMarkers: { x: number; label: string }[] = [];
  const weekMarkers: { x: number; label: string }[] = [];
  {
    const cur = new Date(beginDatum.getFullYear(), beginDatum.getMonth(), 1);
    while (cur <= eindDatum) {
      const x = dateToX(cur);
      if (x >= LINKS_MARGE - 2) maandMarkers.push({ x, label: formatMaand(cur) });
      cur.setMonth(cur.getMonth() + 1);
    }
  }
  if (zoom !== "maand") {
    let cur = vorigeMaandag(new Date(beginDatum));
    while (cur <= eindDatum) {
      const x = dateToX(cur);
      if (x >= LINKS_MARGE) weekMarkers.push({ x, label: formatDag(cur) });
      cur = new Date(cur);
      cur.setDate(cur.getDate() + 7);
    }
  }

  // ── Canvas-pan handlers ──────────────────────────────────────────────────────

  const onCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    canvasDrag.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startOffX: offset.x,
      startOffY: offset.y,
      moved: false,
    };
    e.preventDefault();
  }, [offset]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    // Blokje-drag heeft prioriteit
    if (blokjeDrag.current?.active) {
      const dx = e.clientX - blokjeDrag.current.startClientX;
      const dagsDelta = Math.round(dx / pxPerDag);
      let nieuweDeadline = addDagen(blokjeDrag.current.origineleDeadline, dagsDelta);
      // Minimum = verslagDatum
      if (nieuweDeadline < blokjeDrag.current.verslagDatum) {
        nieuweDeadline = blokjeDrag.current.verslagDatum;
      }
      setSleepState({ nokId: blokjeDrag.current.nokId, deadline: nieuweDeadline });
      return;
    }

    if (!canvasDrag.current.active) return;
    const dx = e.clientX - canvasDrag.current.startX;
    const dy = e.clientY - canvasDrag.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) canvasDrag.current.moved = true;
    const containerW = containerRef.current?.clientWidth ?? 800;
    const minX = Math.min(0, containerW - svgBreedte);
    const minY = Math.min(0, VIEWPORT_H - svgHoogte);
    setOffset({
      x: Math.max(minX, Math.min(0, canvasDrag.current.startOffX + dx)),
      y: Math.max(minY, Math.min(0, canvasDrag.current.startOffY + dy)),
    });
  }, [pxPerDag, svgBreedte, svgHoogte]);

  const onMouseUp = useCallback(async () => {
    // Blokje-drag afronden
    if (blokjeDrag.current?.active && sleepState) {
      const { nokId } = blokjeDrag.current;
      const nieuweDeadline = sleepState.deadline;
      blokjeDrag.current.active = false;
      setSleepState(null);

      try {
        const res = await fetch(`/api/nok-punten/${nokId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deadlineOnly: true, deadline: nieuweDeadline }),
        });
        if (!res.ok) {
          setFoutMelding("Deadline kon niet worden bijgewerkt");
          setTimeout(() => setFoutMelding(null), 3000);
        } else {
          onDeadlineWijzig?.(nokId, nieuweDeadline);
        }
      } catch {
        setFoutMelding("Deadline kon niet worden bijgewerkt");
        setTimeout(() => setFoutMelding(null), 3000);
      }
      blokjeDrag.current = null;
      return;
    }
    canvasDrag.current.active = false;
  }, [sleepState, onDeadlineWijzig]);

  // Reset offset bij zoom-wissel
  useEffect(() => {
    const containerW = containerRef.current?.clientWidth ?? 800;
    const vX = LINKS_MARGE + dagVerschil(beginDatum, vandaag) * ZOOM_PX_PER_DAG[zoom];
    const gewensteX = Math.max(containerW - svgBreedte, Math.min(0, containerW / 2 - vX));
    setOffset({ x: gewensteX, y: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  // ── Early return ─────────────────────────────────────────────────────────────

  if (!heeftData) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
        Nog geen werfverslagen om te tonen.
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────

  const isSlepen = !!sleepState;

  return (
    <div className="relative">
      {foutMelding && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg shadow">
          {foutMelding}
        </div>
      )}
      <div
        ref={containerRef}
        className="relative rounded-xl border border-gray-200 bg-white overflow-hidden"
        style={{ height: VIEWPORT_H, cursor: isSlepen ? "ew-resize" : "grab", userSelect: "none" }}
        onMouseDown={onCanvasMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <svg
          width={svgBreedte}
          height={svgHoogte}
          style={{ display: "block", transform: `translate(${offset.x}px, ${offset.y}px)`, willChange: "transform" }}
        >
          <rect width={svgBreedte} height={svgHoogte} fill="white" />

          {/* Maand-kolom achtergronden */}
          {maandMarkers.map(({ x }, i) => {
            const volgende = maandMarkers[i + 1]?.x ?? (svgBreedte - RECHTS_MARGE);
            return i % 2 === 0 ? (
              <rect key={`mbg-${i}`} x={x} y={0} width={volgende - x} height={svgHoogte} fill="#F9FAFB" />
            ) : null;
          })}

          {/* Week-verticale lijnen */}
          {weekMarkers.map(({ x }, i) => (
            <line key={`wl-${i}`} x1={x} y1={TOP_PAD} x2={x} y2={svgHoogte - BOTTOM_PAD / 2}
              stroke="#E5E7EB" strokeWidth={1} />
          ))}

          {/* Vandaag-lijn */}
          {vandaagZichtbaar && (
            <g>
              <line x1={vandaagX} y1={0} x2={vandaagX} y2={svgHoogte}
                stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.7} />
              <rect x={vandaagX - 24} y={2} width={48} height={17} rx={4} fill="#3B82F6" />
              <text x={vandaagX} y={13} fontSize={9} fill="white" textAnchor="middle"
                fontFamily="sans-serif" fontWeight="bold">Vandaag</text>
            </g>
          )}

          {/* Maand labels */}
          {maandMarkers.map(({ x, label }, i) => (
            <text key={`ml-${i}`} x={x + 4} y={14} fontSize={9} fill="#9CA3AF" fontFamily="sans-serif">{label}</text>
          ))}

          {/* Week labels */}
          {weekMarkers.map(({ x, label }, i) => (
            <text key={`wt-${i}`} x={x + 3} y={svgHoogte - BOTTOM_PAD + 14} fontSize={8}
              fill="#9CA3AF" fontFamily="sans-serif">{label}</text>
          ))}

          {/* Hoofdlijn */}
          <line x1={LINKS_MARGE - 4} y1={mainLineY} x2={svgBreedte - RECHTS_MARGE + 8} y2={mainLineY}
            stroke="#1F2937" strokeWidth={2} />
          <polygon
            points={`${svgBreedte - RECHTS_MARGE + 16},${mainLineY} ${svgBreedte - RECHTS_MARGE + 6},${mainLineY - 5} ${svgBreedte - RECHTS_MARGE + 6},${mainLineY + 5}`}
            fill="#1F2937" />
          <text x={LINKS_MARGE} y={mainLineY - 9} fontSize={9} fill="#6B7280" fontFamily="sans-serif">
            {truncate(projectNaam, 22)}
          </text>

          {/* Verbindingslijnen */}
          {nokItems.map((nok) => {
            const deadlineX = dateToX(parseDate(nok.visueleDeadline));
            const blokjeLinks = deadlineX - BLOKJE_W / 2;
            return (
              <path key={`lijn-${nok.id}`}
                d={`M ${nok.verslagX},${mainLineY} L ${nok.verslagX},${nok.nokCenterY} L ${blokjeLinks - 1},${nok.nokCenterY}`}
                fill="none" stroke="#D1D5DB" strokeWidth={1.5} />
            );
          })}

          {/* Verslagen */}
          {verslagen.map((v) => {
            const x = dateToX(parseDate(v.datum));
            return (
              <g key={v.id}>
                <rect x={x - VERSLAG_W / 2} y={mainLineY - VERSLAG_H / 2}
                  width={VERSLAG_W} height={VERSLAG_H} rx={VERSLAG_R}
                  fill="white" stroke="#1F2937" strokeWidth={1.5} />
                <text x={x} y={mainLineY + 1} fontSize={9} fill="#111827"
                  textAnchor="middle" dominantBaseline="middle"
                  fontFamily="sans-serif" fontWeight="600">
                  {formatDag(parseDate(v.datum))}
                </text>
              </g>
            );
          })}

          {/* NOK-blokjes */}
          {nokItems.map((nok) => {
            const deadlineX = dateToX(parseDate(nok.visueleDeadline));
            const bx = deadlineX - BLOKJE_W / 2;
            const by = nok.nokCenterY - BLOKJE_H / 2;
            const kleur = statusKleur(nok.status);
            const wordtGeslepen = sleepState?.nokId === nok.id;
            const kanSlepen = verslaggeVerModus;

            return (
              <g key={`blokje-${nok.id}`}
                style={{ cursor: kanSlepen ? "ew-resize" : "pointer" }}
                onMouseDown={(e) => {
                  if (kanSlepen) {
                    // Start blokje-drag, stop canvas-pan
                    e.stopPropagation();
                    blokjeDrag.current = {
                      active: true,
                      nokId: nok.id,
                      verslagDatum: nok.verslagDatum,
                      startClientX: e.clientX,
                      origineleDeadline: nok.deadline,
                    };
                  }
                }}
                onClick={(e) => {
                  if (!canvasDrag.current.moved && !blokjeDrag.current) {
                    e.stopPropagation();
                    onBekijkNok(nok.id);
                  }
                }}
              >
                {/* Schaduw */}
                <rect x={bx + 1} y={by + 2} width={BLOKJE_W} height={BLOKJE_H} rx={BLOKJE_R} fill="#00000010" />
                {/* Blokje */}
                <rect x={bx} y={by} width={BLOKJE_W} height={BLOKJE_H} rx={BLOKJE_R}
                  fill="white"
                  stroke={wordtGeslepen ? "#3B82F6" : "#E5E7EB"}
                  strokeWidth={wordtGeslepen ? 2 : 1.5} />
                {/* Status dot */}
                <circle cx={bx + 13} cy={nok.nokCenterY} r={DOT_R} fill={kleur} />
                {/* Titel */}
                <text x={bx + 24} y={nok.nokCenterY + 1} fontSize={10} fill="#111827"
                  dominantBaseline="middle" fontFamily="sans-serif">
                  {truncate(nok.titel, 13)}
                </text>
                {/* Datum-tooltip tijdens slepen */}
                {wordtGeslepen && (
                  <g>
                    <rect x={bx + BLOKJE_W / 2 - 28} y={by - 22} width={56} height={18} rx={4} fill="#1F2937" />
                    <text x={bx + BLOKJE_W / 2} y={by - 10} fontSize={9} fill="white"
                      textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                      {formatDag(parseDate(nok.visueleDeadline))}
                    </text>
                  </g>
                )}
                {/* Klik-overlay */}
                <rect x={bx} y={by} width={BLOKJE_W} height={BLOKJE_H} rx={BLOKJE_R} fill="transparent" />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
