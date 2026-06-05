"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { berekenStatus } from "@/lib/status";

export interface NokPuntDetail {
  id: string;
  titel: string;
  omschrijving: string | null;
  discipline: string;
  verantwoordelijkeNaam: string;
  verantwoordelijkeEmail: string;
  deadline: string;
  status: string;
  fotoUrls: string[];
  opgelostOp: string | null;
  opgelostDoorNaam: string | null;
  oplossingOmschrijving: string | null;
  oplossingFotoUrl: string | null;
  afkeuringsReden: string | null;
  afgekeurdOp: string | null;
  verslagId: string;
}

export function BekijkNokPuntModaal({
  punt,
  verantwoordelijkeModus = false,
  onSluit,
}: {
  punt: NokPuntDetail;
  verantwoordelijkeModus?: boolean;
  onSluit: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const status = berekenStatus(new Date(punt.deadline), punt.status);
  const deadline = new Date(punt.deadline).toLocaleDateString("nl-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [oplossingsScherm, setOplossingsScherm] = useState(false);
  const [opgelostDoor, setOpgelostDoor] = useState("");
  const [oplossingOmschrijving, setOplossingOmschrijving] = useState("");
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  // Afkeuren-scherm (verslaggever)
  const [afkeurenScherm, setAfkeurenScherm] = useState(false);
  const [afkeuringsReden, setAfkeuringsReden] = useState("");

  function fotoKiezen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFoto(f);
    if (f) setFotoPreview(URL.createObjectURL(f));
  }

  async function bevestigOplossing() {
    if (!opgelostDoor.trim()) {
      setFout("Naam is verplicht.");
      return;
    }
    setBezig(true);
    setFout(null);

    const fd = new FormData();
    fd.append("opgelostDoorNaam", opgelostDoor);
    fd.append("oplossingOmschrijving", oplossingOmschrijving);
    if (foto) fd.append("foto", foto);

    const res = await fetch(`/api/nok-punten/${punt.id}/opgelost`, {
      method: "POST",
      body: fd,
    });

    if (res.ok) {
      onSluit();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setFout(data.error ?? "Er is iets misgegaan.");
      setBezig(false);
    }
  }

  async function bevestigAanvaarden() {
    setBezig(true);
    const res = await fetch(`/api/nok-punten/${punt.id}/aanvaarden`, { method: "POST" });
    if (res.ok) {
      onSluit();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setFout(data.error ?? "Er is iets misgegaan.");
      setBezig(false);
    }
  }

  async function bevestigAfkeuren() {
    if (!afkeuringsReden.trim()) {
      setFout("Afkeuringsreden is verplicht.");
      return;
    }
    setBezig(true);
    setFout(null);
    const res = await fetch(`/api/nok-punten/${punt.id}/afkeuren`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ afkeuringsReden }),
    });
    if (res.ok) {
      onSluit();
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setFout(data.error ?? "Er is iets misgegaan.");
      setBezig(false);
    }
  }

  const kanAfvinken =
    punt.status !== "opgelost" && punt.status !== "wacht-op-goedkeuring";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4 py-8">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <h2 className="text-lg font-bold text-gray-900">{punt.titel}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StatusBadge status={status} />
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {punt.discipline}
              </span>
            </div>
          </div>
          <button
            onClick={onSluit}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Details */}
          {punt.omschrijving && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Omschrijving</p>
              <p className="text-sm text-gray-700">{punt.omschrijving}</p>
            </div>
          )}

          {/* Foto's NOK */}
          {punt.fotoUrls.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Foto&apos;s</p>
              <div className="flex flex-wrap gap-2">
                {punt.fotoUrls.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Foto ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-0.5">Verantwoordelijke</p>
              <p className="text-sm text-gray-700">{punt.verantwoordelijkeNaam}</p>
              <p className="text-xs text-gray-400">{punt.verantwoordelijkeEmail}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-0.5">Deadline</p>
              <p className="text-sm text-gray-700">{deadline}</p>
            </div>
          </div>

          {/* Historiek */}
          {(punt.opgelostOp || punt.afkeuringsReden) && (
            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Historiek</p>

              {/* Ingediende oplossing */}
              {punt.opgelostOp && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-700 mb-1">
                    Oplossing ingediend op{" "}
                    {new Date(punt.opgelostOp).toLocaleDateString("nl-BE")}
                    {punt.opgelostDoorNaam && ` door ${punt.opgelostDoorNaam}`}
                  </p>
                  {punt.oplossingOmschrijving && (
                    <p className="text-sm text-blue-800">{punt.oplossingOmschrijving}</p>
                  )}
                  {punt.oplossingFotoUrl && (
                    <a href={punt.oplossingFotoUrl} target="_blank" rel="noopener noreferrer" className="mt-2 block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={punt.oplossingFotoUrl}
                        alt="Foto oplossing"
                        className="w-20 h-20 object-cover rounded-lg border border-blue-200"
                      />
                    </a>
                  )}
                  {punt.status === "opgelost" && (
                    <p className="text-xs text-green-700 font-medium mt-2">✓ Aanvaard door verslaggever</p>
                  )}
                </div>
              )}

              {/* Afkeuring */}
              {punt.afkeuringsReden && punt.afgekeurdOp && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-red-700 mb-1">
                    Afgekeurd op {new Date(punt.afgekeurdOp).toLocaleDateString("nl-BE")}
                  </p>
                  <p className="text-sm text-red-800">{punt.afkeuringsReden}</p>
                </div>
              )}
            </div>
          )}

          {/* Goedkeuringsacties — enkel voor verslaggever wanneer wacht-op-goedkeuring */}
          {!verantwoordelijkeModus && punt.status === "wacht-op-goedkeuring" && !afkeurenScherm && (
            <div className="border border-blue-200 bg-blue-50 rounded-lg p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-blue-900">Oplossing beoordelen</p>
              {fout && <p className="text-xs text-red-600">{fout}</p>}
              <div className="flex gap-2">
                <button
                  onClick={bevestigAanvaarden}
                  disabled={bezig}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {bezig ? "Bezig..." : "Aanvaarden"}
                </button>
                <button
                  onClick={() => { setAfkeurenScherm(true); setFout(null); }}
                  disabled={bezig}
                  className="flex-1 bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                >
                  Afkeuren
                </button>
              </div>
            </div>
          )}

          {/* Afkeurenformulier */}
          {!verantwoordelijkeModus && afkeurenScherm && (
            <div className="border border-red-200 rounded-lg p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-800">Reden van afkeuring</p>
              <textarea
                rows={3}
                value={afkeuringsReden}
                onChange={(e) => setAfkeuringsReden(e.target.value)}
                placeholder="Leg uit waarom de oplossing niet volstaat..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              {fout && <p className="text-xs text-red-600">{fout}</p>}
              <div className="flex gap-2">
                <button
                  onClick={bevestigAfkeuren}
                  disabled={bezig}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {bezig ? "Bezig..." : "Bevestig afkeuring"}
                </button>
                <button
                  onClick={() => { setAfkeurenScherm(false); setFout(null); }}
                  disabled={bezig}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}

          {/* Melding aan verantwoordelijke na indienen */}
          {verantwoordelijkeModus && punt.status === "wacht-op-goedkeuring" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                Oplossing ingediend — wacht op goedkeuring van de verslaggever.
              </p>
            </div>
          )}

          {/* Opgelost markeren — enkel als het punt nog open is */}
          {kanAfvinken && !oplossingsScherm && (
            <button
              onClick={() => setOplossingsScherm(true)}
              className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Markeer als opgelost
            </button>
          )}

          {/* Oplossingsformulier */}
          {oplossingsScherm && (
            <div className="border border-gray-200 rounded-lg p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-gray-800">Oplossing registreren</p>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Opgelost door <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={opgelostDoor}
                  onChange={(e) => setOpgelostDoor(e.target.value)}
                  placeholder="Naam"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Omschrijving oplossing
                </label>
                <textarea
                  rows={2}
                  value={oplossingOmschrijving}
                  onChange={(e) => setOplossingOmschrijving(e.target.value)}
                  placeholder="Optioneel..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Foto van de oplossing
                </label>
                {fotoPreview ? (
                  <div className="relative w-20 h-20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={fotoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                    <button
                      type="button"
                      onClick={() => { setFoto(null); setFotoPreview(null); }}
                      className="absolute -top-1.5 -right-1.5 bg-white border border-gray-300 rounded-full w-5 h-5 flex items-center justify-center text-xs text-gray-500 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={fotoKiezen}
                      className="hidden"
                      id="oplossing-foto"
                    />
                    <label
                      htmlFor="oplossing-foto"
                      className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-sm text-gray-400 hover:border-blue-400 hover:text-blue-500 cursor-pointer"
                    >
                      📷 Foto toevoegen
                    </label>
                  </>
                )}
              </div>

              {fout && <p className="text-xs text-red-600">{fout}</p>}

              <div className="flex gap-2">
                <button
                  onClick={bevestigOplossing}
                  disabled={bezig}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {bezig ? "Bezig..." : "Bevestig oplossing"}
                </button>
                <button
                  onClick={() => setOplossingsScherm(false)}
                  disabled={bezig}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800"
                >
                  Annuleren
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
