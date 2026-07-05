export default function Field({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  hint,
}: {
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      ) : null}
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={!!error}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none transition-all duration-200 placeholder:text-muted focus:ring-4 ${
          error
            ? "border-[#e77] focus:border-[#e77] focus:ring-[#e77]/15"
            : "border-brand-line focus:border-brand focus:ring-brand/15"
        }`}
      />
      {error ? (
        <span className="mt-1.5 block text-sm text-[#d9534f]">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-sm text-muted">{hint}</span>
      ) : null}
    </label>
  );
}
