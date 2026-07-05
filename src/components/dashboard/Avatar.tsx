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
      className={`grid flex-none place-items-center rounded-[13px] font-display font-semibold text-white ${className}`}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: "linear-gradient(145deg,#a9d0f8,#5f9bef)",
      }}
    >
      {initial}
    </span>
  );
}
