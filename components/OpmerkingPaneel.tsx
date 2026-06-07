"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BevestigingDialog } from "@/components/BevestigingDialog";

const TEKST_MAX = 160;

interface Opmerking {
  id: string;
  auteurNaam: string;
  auteurRol: string;
  tekst: string;
  fotoUrls: string[];
  aangemaaktOp: string;
}

interface Props {
  projectId?: string;
  werfverslagId?: string;
  nokPuntId?: string;
  auteurNaam?: string;       // vooraf ingevuld (magic link)
  verantwoordelijkeModus?: boolean;
  titel?: string;            // paneel-titel (standaard "Opmerkingen")
}

export function OpmerkingPaneel({
  projectId,
  werfverslagId,
  nokPuntId,
  auteurNaam: initieleAuteurNaam,
  verantwoordelijkeModus = false,
  titel = "Opmerkingen",
}: Props) {
  const router = useRouter();
  const lijstRef = useRef<HTMLDivElement>(null);
  const [opmerkingen, setOpmerkingen] = useState<Opmerking[]>([]);
  const [laden, setLaden] = useState(true);

  const [auteurNaam, setAuteurNaam] = useState(initieleAuteurNaam ?? "");
  const [auteurRol, setAuteurRol] = useState(verantwoordelijkeModus ? "verantwoordelijke" : "verslaggever");
  const [tekst, setTekst] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  // Detail-modaal (volledige tekst bekijken)
  const [gekozenOpmerking, setGekozenOpmerking] = useState<Opmerking | null>(null);

  // Verwijderen
  const [teVerwijderen, setTeVerwijderen] = useState<Opmerking | null>(null);
  const [verwijderBezig, setVerwijderBezig] = useState(false);

  const queryParam = nokPuntId
    ? `nokPuntId=${nokPuntId}`
    : werfverslagId
    ? `werfverslagId=${werfverslagId}`
    : `projectId=${projectId}`;

  async function laadOpmerkingen() {
    const res = await fetch(`/api/opmerkingen?${queryParam}`);
    const data = await res.json();
    setOpmerkingen(Array.isArray(data) ? data : []);
    setLaden(false);
  }

  useEffect(() => {
    laadOpmerkingen();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParam]);

  // Scroll naar beneden als nieuwe berichten binnenkomen
  useEffect(() => {
    if (lijstRef.current) {
      lijstRef.current.scrollTop = lijstRef.current.scrollHeight;
    }
  }, [opmerkingen]);

  function fotoKiezen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFoto(f);
    if (f) setFotoPreview(URL.createObjectURL(f));
    else setFotoPreview(null);
  }

  async function verstuur(e: React.FormEvent) {
    e.preventDefault();
    if (!tekst.trim()) return;
    if (!auteurNaam.trim()) { setFout("Vul je naam in."); return; }
    setBezig(true);
    setFout(null);

    const fd = new FormData();
    if (projectId) fd.append("projectId", projectId);
    if (werfverslagId) fd.append("werfverslagId", werfverslagId);
    if (nokPuntId) fd.append("nokPuntId", nokPuntId);
    fd.append("auteurNaam", auteurNaam);
    fd.append("auteurRol", auteurRol);
    fd.append("tekst", tekst);
    if (foto) fd.append("foto", foto);

    const res = await fetch("/api/opmerkingen", { method: "POST", body: fd });
    if (res.ok) {
      setTekst("");
      setFoto(null);
      setFotoPreview(null);
      await laadOpmerkingen();
      router.refresh();
    } else {
      const d = await res.json().catch(() => ({}));
      setFout(d.error ?? "Er is iets misgegaan.");
    }
    setBezig(false);
  }

  async function verwijder(opmerking: Opmerking) {
    setVerwijderBezig(true);
    await fetch(`/api/opmerkingen/${opmerking.id}`, { method: "DELETE" });
    setTeVerwijderen(null);
    setGekozenOpmerking(null);
    setVerwijderBezig(false);
    await laadOpmerkingen();
    router.refresh();
  }

  function formatTijd(iso: string) {
    return new Date(iso).toLocaleString("nl-BE", {
      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 flex flex-col h-full" style={{ minHeight: 300 }}>
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{titel}</h3>
        </div>

        {/* Berichtenlijst */}
        <div ref={lijstRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ maxHeight: 260 }}>
          {laden && <p className="text-xs text-gray-400 text-center py-4">Laden...</p>}
          {!laden && opmerkingen.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">Nog geen opmerkingen.</p>
          )}
          {opmerkingen.map((o) => {
            const isVerslaggever = o.auteurRol === "verslaggever";
            const langeTekst = o.tekst.length > TEKST_MAX;
            return (
              <div key={o.id} className="flex flex-col gap-1 group">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-gray-800">{o.auteurNaam}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    isVerslaggever
                      ? "bg-gray-100 text-gray-500"
                      : "bg-blue-100 text-blue-700"
                  }`}>
                    {isVerslaggever ? "verslaggever" : "verantwoordelijke"}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto">{formatTijd(o.aangemaaktOp)}</span>
                  {isVerslaggever && (
                    <button
                      onClick={() => setTeVerwijderen(o)}
                      className="text-[10px] text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      title="Verwijderen"
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 leading-snug whitespace-pre-wrap">
                  {langeTekst ? o.tekst.slice(0, TEKST_MAX) + "…" : o.tekst}
                </p>
                {(langeTekst || o.fotoUrls.length > 0) && (
                  <button
                    onClick={() => setGekozenOpmerking(o)}
                    className="text-xs text-blue-500 hover:text-blue-700 text-left"
                  >
                    {langeTekst ? "meer lezen" : "bekijk foto's"}
                  </button>
                )}
                {!langeTekst && o.fotoUrls.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {o.fotoUrls.slice(0, 2).map((url, i) => (
                      <button key={i} onClick={() => setGekozenOpmerking(o)}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-80" />
                      </button>
                    ))}
                    {o.fotoUrls.length > 2 && (
                      <button onClick={() => setGekozenOpmerking(o)}
                        className="w-16 h-16 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        +{o.fotoUrls.length - 2}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Invoerformulier */}
        <form onSubmit={verstuur} className="px-4 py-3 border-t border-gray-100 flex flex-col gap-2">
          {/* Naam — verberg als verantwoordelijke (auto-ingevuld) */}
          {!verantwoordelijkeModus && (
            <div className="flex gap-2">
              <input
                type="text"
                value={auteurNaam}
                onChange={(e) => setAuteurNaam(e.target.value)}
                placeholder="Jouw naam"
                className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={auteurRol}
                onChange={(e) => setAuteurRol(e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="verslaggever">Verslaggever</option>
                <option value="verantwoordelijke">Verantwoordelijke</option>
              </select>
            </div>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              value={tekst}
              onChange={(e) => setTekst(e.target.value)}
              placeholder="Schrijf een opmerking..."
              rows={2}
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              disabled={bezig || !tekst.trim()}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-blue-700 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              {bezig ? "..." : "Stuur"}
            </button>
          </div>

          {/* Foto */}
          <div className="flex items-center gap-2">
            {fotoPreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={fotoPreview} alt="" className="w-10 h-10 object-cover rounded border border-gray-200" />
                <button type="button" onClick={() => { setFoto(null); setFotoPreview(null); }}
                  className="absolute -top-1 -right-1 bg-white border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-[9px] text-gray-500 hover:text-red-500">
                  ✕
                </button>
              </div>
            ) : (
              <>
                <input type="file" accept="image/*" onChange={fotoKiezen} className="hidden" id={`foto-${queryParam}`} />
                <label htmlFor={`foto-${queryParam}`}
                  className="text-xs text-gray-400 hover:text-blue-500 cursor-pointer flex items-center gap-1">
                  📎 Foto toevoegen
                </label>
              </>
            )}
            {fout && <p className="text-xs text-red-600 ml-auto">{fout}</p>}
          </div>
        </form>
      </div>

      {/* Detail-modaal (volledige tekst + foto's) */}
      {gekozenOpmerking && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8"
          onClick={() => setGekozenOpmerking(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between p-4 border-b border-gray-100">
              <div>
                <span className="text-sm font-semibold text-gray-800">{gekozenOpmerking.auteurNaam}</span>
                <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  gekozenOpmerking.auteurRol === "verslaggever"
                    ? "bg-gray-100 text-gray-500"
                    : "bg-blue-100 text-blue-700"
                }`}>
                  {gekozenOpmerking.auteurRol === "verslaggever" ? "verslaggever" : "verantwoordelijke"}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5">{formatTijd(gekozenOpmerking.aangemaaktOp)}</p>
              </div>
              <button onClick={() => setGekozenOpmerking(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{gekozenOpmerking.tekst}</p>
              {gekozenOpmerking.fotoUrls.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gekozenOpmerking.fotoUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-24 h-24 object-cover rounded-lg border border-gray-200 hover:opacity-80" />
                    </a>
                  ))}
                </div>
              )}
              {gekozenOpmerking.auteurRol === "verslaggever" && (
                <button
                  onClick={() => { setGekozenOpmerking(null); setTeVerwijderen(gekozenOpmerking); }}
                  className="text-sm text-red-500 hover:text-red-700 text-left"
                >
                  🗑️ Opmerking verwijderen
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bevestiging verwijderen */}
      {teVerwijderen && (
        <BevestigingDialog
          titel="Opmerking verwijderen?"
          bericht="Ben je zeker dat je deze opmerking wil verwijderen?"
          bezig={verwijderBezig}
          onBevestig={() => verwijder(teVerwijderen)}
          onAnnuleer={() => setTeVerwijderen(null)}
        />
      )}
    </>
  );
}
