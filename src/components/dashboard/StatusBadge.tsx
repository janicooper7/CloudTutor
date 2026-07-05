import type { SessionStatus } from "@/lib/mock";

const map: Record<SessionStatus, { label: string; cls: string }> = {
  draft: { label: "Needs review", cls: "bg-amber/15 text-[#b5791f] border-amber/25" },
  confirmed: { label: "Confirmed", cls: "bg-brand-soft text-brand-deep border-brand-line" },
  sent: { label: "Completed", cls: "bg-mint/14 text-[#137e70] border-mint/25" },
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
