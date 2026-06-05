"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BevestigingDialog } from "@/components/BevestigingDialog";

export function AdresboekVerwijderKnop({
  contactId,
  contactNaam,
}: {
  contactId: string;
  contactNaam: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bezig, setBezig] = useState(false);

  async function verwijder() {
    setBezig(true);
    await fetch(`/api/adressenboek/${contactId}`, { method: "DELETE" });
    setOpen(false);
    setBezig(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded"
      >
        Verwijderen
      </button>
      {open && (
        <BevestigingDialog
          titel="Contact verwijderen?"
          bericht={`Ben je zeker dat je "${contactNaam}" wil verwijderen uit het adressenboek? Bestaande projectdeelnemers worden ontkoppeld maar niet verwijderd.`}
          bezig={bezig}
          onBevestig={verwijder}
          onAnnuleer={() => setOpen(false)}
        />
      )}
    </>
  );
}
