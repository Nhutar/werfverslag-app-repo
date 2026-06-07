"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { BevestigingDialog } from "@/components/BevestigingDialog";
import { StatusTellers } from "@/components/StatusTellers";
import { NokStatus } from "@/lib/status";

interface ProjectKaart {
  id: string;
  naam: string;
  werfadres: string;
  bouwheer: string | null;
  aantalVerslagen: number;
  aantalPunten: number;
  tellers: Record<NokStatus, number>;
}

export function ProjectKaartLijst({ projecten }: { projecten: ProjectKaart[] }) {
  const router = useRouter();
  const [teVerwijderen, setTeVerwijderen] = useState<ProjectKaart | null>(null);
  const [bezig, setBezig] = useState(false);

  async function verwijder(project: ProjectKaart) {
    setBezig(true);
    await fetch(`/api/projecten/${project.id}`, { method: "DELETE" });
    setTeVerwijderen(null);
    setBezig(false);
    router.refresh();
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {projecten.map((project) => (
          <div key={project.id} className="relative">
            <Link
              href={`/project/${project.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="pr-20">
                <p className="font-semibold text-gray-900 truncate">{project.naam}</p>
                <p className="text-sm text-gray-500 mt-0.5">{project.werfadres}</p>
                {project.bouwheer && (
                  <p className="text-xs text-gray-400 mt-0.5">Bouwheer: {project.bouwheer}</p>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                <span className="text-xs text-gray-500">
                  {project.aantalVerslagen}{" "}
                  {project.aantalVerslagen === 1 ? "werfverslag" : "werfverslagen"}
                </span>
                {project.aantalPunten === 0 ? (
                  <span className="text-xs text-gray-400">Geen punten</span>
                ) : (
                  <StatusTellers tellers={project.tellers} />
                )}
              </div>
            </Link>

            <div className="absolute top-4 right-4 flex items-center gap-0.5">
              <button
                onClick={(e) => { e.preventDefault(); router.push(`/project/${project.id}/aanpassen`); }}
                className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm"
                title="Aanpassen"
              >
                ✏️
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setTeVerwijderen(project); }}
                className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors text-sm"
                title="Verwijderen"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {teVerwijderen && (
        <BevestigingDialog
          titel="Project verwijderen?"
          bericht={`Ben je zeker dat je "${teVerwijderen.naam}" wil verwijderen?`}
          waarschuwing={
            teVerwijderen.aantalVerslagen > 0
              ? `Dit project bevat ${teVerwijderen.aantalVerslagen} werfverslag${teVerwijderen.aantalVerslagen === 1 ? "" : "en"}. Alles wordt mee verwijderd (punten en foto's inbegrepen).`
              : undefined
          }
          bezig={bezig}
          onBevestig={() => verwijder(teVerwijderen)}
          onAnnuleer={() => setTeVerwijderen(null)}
        />
      )}
    </>
  );
}
