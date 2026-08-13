import type { SessionStatus } from "@/lib/mock";

const map: Record<SessionStatus, { label: string; cls: string }> = {
  draft: { label: "Needs review", cls: "bg-danger/12 text-danger-deep border-danger/25" },
  confirmed: { label: "Confirmed", cls: "bg-info/12 text-info-deep border-info/25" },
  sent: { label: "Completed", cls: "bg-success/12 text-success-deep border-success/25" },
};

export default function StatusBadge({ status }: { status: SessionStatus }) {
  const { label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cls}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
