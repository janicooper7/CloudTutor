export default function Logo({
  size = 34,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size * 1.25}
      height={size * 1.25}
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden
      className={className}
      style={{ marginBottom: -size * 0.13 }}
    >
      <path
        d='M6 15a4 4 0 0 1 .5-7.98A5.5 5.5 0 0 1 17.5 8 3.5 3.5 0 0 1 18 15H6Z'
        fill='var(--color-brand)'
      />
      <path
        d='M9.5 11.5l1.8 1.8 3.4-3.6'
        transform='translate(0 -1.2)'
        stroke='#fff'
        strokeWidth='1.7'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}
