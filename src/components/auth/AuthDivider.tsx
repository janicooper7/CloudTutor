// A rule with a word set into it, separating the Google button from the
// email/password form.

export default function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-4" aria-hidden>
      <span className="h-px flex-1 bg-brand-line" />
      <span className="text-sm text-muted">{label}</span>
      <span className="h-px flex-1 bg-brand-line" />
    </div>
  );
}
