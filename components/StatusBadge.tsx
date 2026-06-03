import { NokStatus, STATUS_KLEUREN, STATUS_LABELS } from "@/lib/status";

export function StatusBadge({ status }: { status: NokStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_KLEUREN[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
