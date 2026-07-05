import Topbar from "@/components/dashboard/Topbar";

export default function SettingsPage() {
  return (
    <>
      <Topbar title="Settings" subtitle="Account, billing, and preferences" />
      <div className="px-6 py-8 lg:px-10">
        <div className="grid max-w-3xl gap-4">
          {[
            { t: "Profile", d: "Your name, email, and photo." },
            { t: "Billing & plan", d: "You're on the Pro plan. Manage your subscription." },
            { t: "Consent & recording", d: "How students are notified that lessons are analyzed." },
          ].map((s) => (
            <div
              key={s.t}
              className="flex items-center justify-between rounded-2xl border border-line bg-surface p-6 shadow-soft-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-soft-md"
            >
              <div>
                <div className="font-semibold text-ink">{s.t}</div>
                <div className="text-sm text-ink-soft">{s.d}</div>
              </div>
              <span className="rounded-lg border border-brand-line bg-white/60 px-4 py-2 text-sm font-semibold text-ink">
                Manage
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
