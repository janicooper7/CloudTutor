export default function Avatar({
  initial,
  size = 44,
  className = "",
}: {
  initial: string;
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`grid flex-none place-items-center rounded-[13px] font-display font-semibold text-ink ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: "linear-gradient(145deg,#ffd143,#f0a500)",
      }}
    >
      {initial}
    </span>
  );
}
