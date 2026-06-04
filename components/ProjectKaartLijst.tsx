"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { DrieKnopjesMenu } from "@/components/DrieKnopjesMenu";
import { BevestigingDialog } from "@/components/BevestigingDialog";
import { STATUS_DOT, NokStatus } from "@/lib/status";

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
              <div className="pr-8">
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
                <div className="flex gap-3 flex-wrap justify-end">
                  {(["voorbij-deadline", "bijna-deadline", "open", "opgelost"] as NokStatus[]).map(
                    (s) =>
                      project.tellers[s] > 0 && (
                        <span key={s} className="inline-flex items-center gap-1 text-xs text-gray-600">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${STATUS_DOT[s]}`} />
                          {project.tellers[s]}
                        </span>
                      )
                  )}
                  {project.aantalPunten === 0 && (
                    <span className="text-xs text-gray-400">Geen punten</span>
                  )}
                </div>
              </div>
            </Link>

            <div className="absolute top-4 right-4">
              <DrieKnopjesMenu
                opties={[
                  { label: "Aanpassen", onClick: () => router.push(`/project/${project.id}/aanpassen`) },
                  { label: "Verwijderen", onClick: () => setTeVerwijderen(project), gevaarlijk: true },
                ]}
              />
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
