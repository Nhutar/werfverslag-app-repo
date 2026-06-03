export type NokStatus =
  | "open"
  | "bijna-deadline"
  | "voorbij-deadline"
  | "opgelost";

export function berekenStatus(deadline: Date, status: string): NokStatus {
  if (status === "opgelost") return "opgelost";

  const nu = new Date();
  nu.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);

  const dagVerschil = Math.ceil(
    (deadlineDate.getTime() - nu.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dagVerschil < 0) return "voorbij-deadline";
  if (dagVerschil <= 7) return "bijna-deadline";
  return "open";
}

export const STATUS_LABELS: Record<NokStatus, string> = {
  open: "Open",
  "bijna-deadline": "Bijna deadline",
  "voorbij-deadline": "Voorbij deadline",
  opgelost: "Opgelost",
};

export const STATUS_KLEUREN: Record<NokStatus, string> = {
  open: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  "bijna-deadline": "bg-orange-100 text-orange-800 border border-orange-300",
  "voorbij-deadline": "bg-red-100 text-red-800 border border-red-300",
  opgelost: "bg-green-100 text-green-800 border border-green-300",
};

export const STATUS_DOT: Record<NokStatus, string> = {
  open: "bg-yellow-400",
  "bijna-deadline": "bg-orange-500",
  "voorbij-deadline": "bg-red-500",
  opgelost: "bg-green-500",
};
