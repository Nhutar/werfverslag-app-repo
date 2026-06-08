"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { berekenStatus } from "@/lib/status";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TijdlijnNokItem {
  id: string;
  titel: string;
  discipline: string;
  deadline: string;
  status: string;
  verslagDatum: string;
}

export interface TijdlijnVerslagItem {
  id: string;
  datum: string;
  nokPunten: TijdlijnNokItem[];
}

export type ZoomNiveau = "7dagen" | "maand" | "alles";

interface Props {
  verslagen: TijdlijnVerslagItem[];
  startdatum?: string | null;
  projectNaam: string;
  zoom: ZoomNiveau;
  verslaggeVerModus?: boolean;
  geselecteerdVerslagId?: string | null;
  volledigScherm?: boolean;
  onBekijkNok: (nokId: string, verslagId: string) => void;
  onVerslagKlik?: (verslagId: string) => void;
  onDeselecteer?: () => void;
  onDeadlineWijzig?: (nokId: string, nieuweDeadline: string) => void;
}

// ─── Layout constanten ────────────────────────────────────────────────────────

const LEVEL_H = 42;
const BLOKJE_W = 130;
const BLOKJE_H = 26;
const BLOKJE_R = 6;
const LINKS_MARGE = 16;
const RECHTS_MARGE = BLOKJE_W / 2 + 24;
const TOP_PAD = 36;
const BOTTOM_PAD = 36;
const VERSLAG_W = 84;
const VERSLAG_H = 24;
const VERSLAG_R = 5;
const DOT_R = 5;
const VIEWPORT_H = 480;
const VIEWPORT_H_FULLSCREEN = 700;

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
  geselecteerdVerslagId,
  volledigScherm = false,
  onBekijkNok,
  onVerslagKlik,
  onDeselecteer,
  onDeadlineWijzig,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [containerBreedte, setContainerBreedte] = useState(1100);
  const [pxPerDag, setPxPerDag] = useState(containerBreedte / 7);

  const canvasDrag = useRef({
    active: false, startX: 0, startY: 0,
    startOffX: 0, startOffY: 0, moved: false,
  });

  const router = useRouter();

  const blokjeDrag = useRef<{
    nokId: string;
    verslagId: string;
    verslagDatum: string;
    startClientX: number;
    origineleDeadline: string;
    dragActief: boolean;
  } | null>(null);

  const [sleepState, setSleepState] = useState<{ nokId: string; deadline: string } | null>(null);
  const [foutMelding, setFoutMelding] = useState<string | null>(null);

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

  // ── Container breedte meten + ResizeObserver ──────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerBreedte(el.clientWidth));
    ro.observe(el);
    setContainerBreedte(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // ── Zoom-knop: stel pxPerDag in op basis van containerbreedte ────────────────
  useEffect(() => {
    const w = containerRef.current?.clientWidth ?? containerBreedte;
    const nuttigeB = w - LINKS_MARGE - RECHTS_MARGE;
    let px: number;
    if (zoom === "7dagen") px = nuttigeB / 7;
    else if (zoom === "maand") px = nuttigeB / 28;
    else px = Math.max(0.5, nuttigeB / Math.max(totaleDagen, 1));
    setPxPerDag(px);
    // Centreer op vandaag
    const vX = LINKS_MARGE + dagVerschil(beginDatum, vandaag) * px;
    setOffset({ x: Math.min(0, w / 2 - vX), y: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom, containerBreedte]);

  // ── Muiswieltje: zoom in/uit richting muispositie ─────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      setPxPerDag(prev => Math.max(0.2, Math.min(500, prev * factor)));
      // Zoom richting muispositie
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      setOffset(prev => ({
        x: (mouseX - LINKS_MARGE) * (1 - factor) + prev.x * factor,
        y: 0,
      }));
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  // ── Overlap-vrije niveauplaatsing ─────────────────────────────────────────────
  type Plaatsing = { deadlineX: number; level: number; richting: number };
  const geplaatst: Plaatsing[] = [];

  function vindNiveau(deadlineX: number): { level: number; richting: number } {
    for (let level = 1; level <= 20; level++) {
      for (const richting of [-1, 1] as const) {
        const conflict = geplaatst.some(
          (p) => p.level === level && p.richting === richting &&
                 Math.abs(p.deadlineX - deadlineX) < BLOKJE_W
        );
        if (!conflict) return { level, richting };
      }
    }
    return { level: 20, richting: -1 };
  }

  type NokPlaatsing = {
    nok: TijdlijnNokItem; verslagX: number; verslagId: string;
    level: number; richting: number; visueleDeadline: string;
  };
  const nokPlaatsingen: NokPlaatsing[] = [];

  const alleItems: { v: TijdlijnVerslagItem; nok: TijdlijnNokItem }[] = [];
  for (const v of verslagen) {
    for (const nok of v.nokPunten) alleItems.push({ v, nok });
  }
  alleItems.sort((a, b) => {
    const d = a.nok.discipline.localeCompare(b.nok.discipline);
    return d !== 0 ? d : a.nok.id.localeCompare(b.nok.id);
  });

  for (const { v, nok } of alleItems) {
    const verslagX = dateToX(parseDate(v.datum));
    const visueleDeadline = (sleepState?.nokId === nok.id) ? sleepState.deadline : nok.deadline;
    const stableDeadlineX = dateToX(parseDate(nok.deadline));
    const { level, richting } = vindNiveau(stableDeadlineX);
    geplaatst.push({ deadlineX: stableDeadlineX, level, richting });
    nokPlaatsingen.push({ nok, verslagX, verslagId: v.id, level, richting, visueleDeadline });
  }

  let maxAbove = 0;
  let maxBelow = 0;
  for (const p of nokPlaatsingen) {
    if (p.richting === -1 && p.level > maxAbove) maxAbove = p.level;
    if (p.richting === 1 && p.level > maxBelow) maxBelow = p.level;
  }

  const mainLineY = TOP_PAD + maxAbove * LEVEL_H;
  const viewportH = volledigScherm ? VIEWPORT_H_FULLSCREEN : VIEWPORT_H;
  const svgHoogte = Math.max(viewportH, mainLineY + maxBelow * LEVEL_H + BOTTOM_PAD);
  const svgBreedte = LINKS_MARGE + totaleDagen * pxPerDag + RECHTS_MARGE;

  type NokItem = TijdlijnNokItem & { verslagX: number; nokCenterY: number; visueleDeadline: string; verslagId: string };
  const nokItems: NokItem[] = nokPlaatsingen.map(({ nok, verslagX, verslagId, level, richting, visueleDeadline }) => ({
    ...nok, verslagX, verslagId,
    nokCenterY: mainLineY + richting * level * LEVEL_H,
    visueleDeadline,
  }));

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
  // Weeklijnen tonen als er voldoende ruimte is
  if (pxPerDag > 2) {
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
      active: true, startX: e.clientX, startY: e.clientY,
      startOffX: offset.x, startOffY: offset.y, moved: false,
    };
    e.preventDefault();
  }, [offset]);

  const DRAG_DREMPEL_PX = 15;

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (blokjeDrag.current) {
      const dx = e.clientX - blokjeDrag.current.startClientX;
      if (!blokjeDrag.current.dragActief) {
        if (Math.abs(dx) < DRAG_DREMPEL_PX) return;
        blokjeDrag.current.dragActief = true;
      }
      const dagsDelta = Math.round(dx / pxPerDag);
      let nieuweDeadline = addDagen(blokjeDrag.current.origineleDeadline, dagsDelta);
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
    const minY = Math.min(0, viewportH - svgHoogte);
    setOffset({
      x: Math.max(minX, Math.min(0, canvasDrag.current.startOffX + dx)),
      y: Math.max(minY, Math.min(0, canvasDrag.current.startOffY + dy)),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pxPerDag, svgBreedte, svgHoogte, viewportH]);

  const onMouseUp = useCallback(async () => {
    if (blokjeDrag.current) {
      const drag = blokjeDrag.current;
      blokjeDrag.current = null;
      if (!drag.dragActief) {
        setSleepState(null);
        onBekijkNok(drag.nokId, drag.verslagId);
        return;
      }
      const nieuweDeadline = sleepState?.deadline ?? drag.origineleDeadline;
      setSleepState(null);
      if (nieuweDeadline === drag.origineleDeadline) return;
      try {
        const res = await fetch(`/api/nok-punten/${drag.nokId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deadlineOnly: true, deadline: nieuweDeadline }),
        });
        if (!res.ok) {
          setFoutMelding("Deadline kon niet worden bijgewerkt");
          setTimeout(() => setFoutMelding(null), 3000);
        } else {
          onDeadlineWijzig?.(drag.nokId, nieuweDeadline);
          router.refresh();
        }
      } catch {
        setFoutMelding("Deadline kon niet worden bijgewerkt");
        setTimeout(() => setFoutMelding(null), 3000);
      }
      return;
    }
    if (canvasDrag.current.active && !canvasDrag.current.moved) {
      onDeselecteer?.();
    }
    canvasDrag.current.active = false;
  }, [sleepState, onDeadlineWijzig, onBekijkNok, onDeselecteer, router]);

  if (!heeftData) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-xl border border-gray-200">
        Nog geen werfverslagen om te tonen.
      </div>
    );
  }

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
        style={{ height: viewportH, cursor: sleepState ? "ew-resize" : "grab", userSelect: "none", flex: volledigScherm ? "1" : undefined }}
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

          {/* Render-volgorde: lijnen → NOK-blokjes → verslag-datumblokjes
              Verslag-datumblokjes liggen altijd bovenop alles → altijd klikbaar.
              Geselecteerd verslag steeds als laatste binnen pass 2 en 3 → bovenaan. */}
          {(() => {
            const gesorteerd = [...verslagen].sort(
              (a, b) => parseDate(a.datum).getTime() - parseDate(b.datum).getTime()
            );
            const volgorde = geselecteerdVerslagId
              ? [
                  ...gesorteerd.filter(v => v.id !== geselecteerdVerslagId),
                  ...gesorteerd.filter(v => v.id === geselecteerdVerslagId),
                ]
              : gesorteerd;

            return (
              <>
                {/* Pass 1 — alle verbindingslijnen (achtergrond) */}
                {volgorde.map((v) => {
                  const isVaag = geselecteerdVerslagId != null && geselecteerdVerslagId !== v.id;
                  const layerNoks = nokItems.filter(n => n.verslagId === v.id);
                  return (
                    <g key={`lijnen-${v.id}`} opacity={isVaag ? 0.12 : 1}>
                      {layerNoks.map((nok) => {
                        const deadlineX = dateToX(parseDate(nok.visueleDeadline));
                        const blokjeLinks = deadlineX - BLOKJE_W / 2;
                        return (
                          <path key={`lijn-${nok.id}`}
                            d={`M ${nok.verslagX},${mainLineY} L ${nok.verslagX},${nok.nokCenterY} L ${blokjeLinks - 1},${nok.nokCenterY}`}
                            fill="none" stroke="#6B7280" strokeWidth={1.5} />
                        );
                      })}
                    </g>
                  );
                })}

                {/* Pass 2 — alle NOK-blokjes (bovenop lijnen, geselecteerde verslag als laatste) */}
                {volgorde.map((v) => {
                  const isActief = geselecteerdVerslagId === v.id;
                  const isVaag = geselecteerdVerslagId != null && !isActief;
                  const layerNoks = nokItems.filter(n => n.verslagId === v.id);
                  return (
                    <g key={`blokjes-${v.id}`} opacity={isVaag ? 0.12 : 1}>
                      {layerNoks.map((nok) => {
                        const deadlineX = dateToX(parseDate(nok.visueleDeadline));
                        const bx = deadlineX - BLOKJE_W / 2;
                        const by = nok.nokCenterY - BLOKJE_H / 2;
                        const kleur = statusKleur(berekenStatus(parseDate(nok.visueleDeadline), nok.status));
                        const wordtGeslepen = sleepState?.nokId === nok.id;
                        return (
                          <g key={`blokje-${nok.id}`}
                            style={{ cursor: "pointer" }}
                            onMouseDown={(e) => {
                              if (verslaggeVerModus) {
                                e.stopPropagation();
                                blokjeDrag.current = {
                                  nokId: nok.id,
                                  verslagId: nok.verslagId,
                                  verslagDatum: nok.verslagDatum,
                                  startClientX: e.clientX,
                                  origineleDeadline: nok.deadline,
                                  dragActief: false,
                                };
                              }
                            }}
                          >
                            <rect x={bx + 1} y={by + 2} width={BLOKJE_W} height={BLOKJE_H} rx={BLOKJE_R} fill="#00000010" />
                            <rect x={bx} y={by} width={BLOKJE_W} height={BLOKJE_H} rx={BLOKJE_R}
                              fill="white"
                              stroke={wordtGeslepen ? "#3B82F6" : isActief ? "#1F2937" : "#E5E7EB"}
                              strokeWidth={wordtGeslepen ? 2 : isActief ? 1.5 : 1} />
                            <circle cx={bx + 13} cy={nok.nokCenterY} r={DOT_R} fill={kleur} />
                            <text x={bx + 24} y={nok.nokCenterY - 4} fontSize={10} fill="#111827"
                              dominantBaseline="middle" fontFamily="sans-serif">
                              {truncate(nok.titel, 13)}
                            </text>
                            <text x={bx + 24} y={nok.nokCenterY + 9} fontSize={8} fill="#9CA3AF"
                              dominantBaseline="middle" fontFamily="sans-serif">
                              {truncate(nok.discipline, 16)}
                            </text>
                            {wordtGeslepen && (
                              <g>
                                <rect x={bx + BLOKJE_W / 2 - 28} y={by - 22} width={56} height={18} rx={4} fill="#1F2937" />
                                <text x={bx + BLOKJE_W / 2} y={by - 10} fontSize={9} fill="white"
                                  textAnchor="middle" fontFamily="sans-serif" fontWeight="bold">
                                  {formatDag(parseDate(nok.visueleDeadline))}
                                </text>
                              </g>
                            )}
                            <rect x={bx} y={by} width={BLOKJE_W} height={BLOKJE_H} rx={BLOKJE_R} fill="transparent" />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* Pass 3 — alle verslag-datumblokjes (altijd bovenop alles → altijd klikbaar) */}
                {volgorde.map((v) => {
                  const verslagX = dateToX(parseDate(v.datum));
                  const isActief = geselecteerdVerslagId === v.id;
                  return (
                    <g key={`verslag-${v.id}`} style={{ cursor: "pointer" }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => onVerslagKlik?.(v.id)}
                    >
                      <rect x={verslagX - VERSLAG_W / 2} y={mainLineY - VERSLAG_H / 2}
                        width={VERSLAG_W} height={VERSLAG_H} rx={VERSLAG_R}
                        fill={isActief ? "#2563EB" : "white"}
                        stroke={isActief ? "#2563EB" : "#1F2937"}
                        strokeWidth={isActief ? 2 : 1.5} />
                      <text x={verslagX} y={mainLineY + 1} fontSize={9}
                        fill={isActief ? "white" : "#111827"}
                        textAnchor="middle" dominantBaseline="middle"
                        fontFamily="sans-serif" fontWeight="600">
                        {formatDag(parseDate(v.datum))}
                      </text>
                    </g>
                  );
                })}
              </>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
