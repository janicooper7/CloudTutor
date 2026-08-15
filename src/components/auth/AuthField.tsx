// Labelled input shared by the login and signup forms. Matches the field on the
// site gate (src/app/enter/page.tsx) — same radii, ring and error red.

export default function AuthField({
  label,
  name,
  type = "text",
  autoComplete,
  error,
  defaultValue,
  autoFocus,
  hint,
  minLength,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  error?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  hint?: string;
  minLength?: number;
}) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <input
        type={type}
        name={name}
        required
        minLength={minLength}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none transition-all duration-200 placeholder:text-muted focus:ring-4 ${
          error
            ? "border-[#e77] focus:border-[#e77] focus:ring-[#e77]/15"
            : "border-brand-line focus:border-brand focus:ring-brand/30"
        }`}
      />
      {error ? (
        <span id={`${name}-error`} className="mt-1.5 block text-sm text-[#d9534f]">
          {error}
        </span>
      ) : hint ? (
        <span id={`${name}-hint`} className="mt-1.5 block text-sm text-muted">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
