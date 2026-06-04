"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DrieKnopjesMenu } from "@/components/DrieKnopjesMenu";
import { BevestigingDialog } from "@/components/BevestigingDialog";
import { DISCIPLINES } from "@/lib/disciplines";

interface Aanwezige {
  id: string;
  naam: string;
  discipline: string;
  email: string;
}

export function AanwezigenBeheer({ aanwezigen }: { aanwezigen: Aanwezige[] }) {
  const router = useRouter();
  const [teVerwijderen, setTeVerwijderen] = useState<Aanwezige | null>(null);
  const [teAanpassen, setTeAanpassen] = useState<Aanwezige | null>(null);
  const [bewerkNaam, setBewerkNaam] = useState("");
  const [bewerkDiscipline, setBewerkDiscipline] = useState("");
  const [bewerkEmail, setBewerkEmail] = useState("");
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState("");

  function openAanpassen(a: Aanwezige) {
    setTeAanpassen(a);
    setBewerkNaam(a.naam);
    setBewerkDiscipline(a.discipline);
    setBewerkEmail(a.email);
    setFout("");
  }

  async function slaAanpassingOp() {
    if (!teAanpassen) return;
    if (!bewerkNaam.trim() || !bewerkEmail.trim()) {
      setFout("Naam en e-mail zijn verplicht.");
      return;
    }
    setBezig(true);
    setFout("");

    const res = await fetch(`/api/aanwezigen/${teAanpassen.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ naam: bewerkNaam, discipline: bewerkDiscipline, email: bewerkEmail }),
    });

    if (res.ok) {
      setTeAanpassen(null);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setFout(data.error ?? "Er is iets misgegaan.");
    }
    setBezig(false);
  }

  async function verwijder(aanwezige: Aanwezige) {
    setBezig(true);
    await fetch(`/api/aanwezigen/${aanwezige.id}`, { method: "DELETE" });
    setTeVerwijderen(null);
    setBezig(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-1">
        {aanwezigen.map((a) => (
          <div key={a.id} className="flex items-center justify-between group">
            <p className="text-sm text-gray-600">
              <span className="font-medium">{a.naam}</span>{" "}
              <span className="text-gray-400">— {a.discipline}</span>
            </p>
            <DrieKnopjesMenu
              opties={[
                { label: "Aanpassen", onClick: () => openAanpassen(a) },
                { label: "Verwijderen", onClick: () => setTeVerwijderen(a), gevaarlijk: true },
              ]}
            />
          </div>
        ))}
      </div>

      {/* Aanpassen modaal */}
      {teAanpassen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Aanwezige aanpassen</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bewerkNaam}
                  onChange={(e) => setBewerkNaam(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discipline
                </label>
                <select
                  value={bewerkDiscipline}
                  onChange={(e) => setBewerkDiscipline(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DISCIPLINES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={bewerkEmail}
                  onChange={(e) => setBewerkEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {fout && (
              <p className="text-sm text-red-600 mt-3">{fout}</p>
            )}
            <div className="flex gap-3 mt-5">
              <button
                onClick={slaAanpassingOp}
                disabled={bezig}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {bezig ? "Bezig..." : "Opslaan"}
              </button>
              <button
                onClick={() => setTeAanpassen(null)}
                disabled={bezig}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verwijder bevestiging */}
      {teVerwijderen && (
        <BevestigingDialog
          titel="Aanwezige verwijderen?"
          bericht={`Ben je zeker dat je "${teVerwijderen.naam}" wil verwijderen?`}
          bezig={bezig}
          onBevestig={() => verwijder(teVerwijderen)}
          onAnnuleer={() => setTeVerwijderen(null)}
        />
      )}
    </>
  );
}
