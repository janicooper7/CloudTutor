import Reveal from '../Reveal'

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className='mb-2.5 text-[.72rem] font-bold uppercase tracking-[.12em] text-muted'>
      {children}
    </div>
  )
}

export default function FeedbackSplit() {
  return (
    <section id='feedback' className='pb-24'>
      <div className='mx-auto w-full max-w-[1160px] px-8'>
        <Reveal className='mx-auto mb-14 max-w-2xl text-center'>
          <div className='text-[.82rem] font-bold uppercase tracking-widest text-brand'>
            Two outputs, one lesson
          </div>
          <h2 className='mt-4 font-display text-[clamp(2rem,3.8vw,2.9rem)] font-medium tracking-tight'>
            One for the student. <br></br>One just for you.
          </h2>
          <p className='mt-4 text-lg text-ink-soft'>
            Every lesson turns into a warm recap your student keeps — and a
            private set of notes only you see.
          </p>
        </Reveal>

        <div className='grid grid-cols-1 items-stretch gap-6 md:grid-cols-2'>
          {/* ---- STUDENT: emailed recap ---- */}
          <Reveal delay={80}>
            <article className='group flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white shadow-soft-md transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg'>
              <div
                className='h-1.5 w-full'
                style={{
                  background:
                    'linear-gradient(90deg,var(--color-brand),var(--color-brand-deep))',
                }}
              />
              <div className='flex flex-1 flex-col p-8'>
                {/* email meta */}
                <div className='mb-6 flex items-center justify-between'>
                  <div className='flex items-center gap-2.5 text-sm text-ink-soft'>
                    <span className='grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand-deep'>
                      <svg
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='1.8'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      >
                        <rect x='3' y='5' width='18' height='14' rx='2' />
                        <path d='m3 7 9 6 9-6' />
                      </svg>
                    </span>
                    Emailed to your student
                  </div>
                  <span className='rounded-md border border-brand-line bg-brand-soft px-2 py-1 text-[.7rem] font-bold text-brand-deep'>
                    PDF
                  </span>
                </div>

                <h3 className='font-display text-2xl font-medium text-ink'>
                  Your lesson recap
                </h3>
                <p className='mt-1.5 text-ink-soft'>
                  Plain-English and encouraging — something they&apos;ll
                  actually keep.
                </p>

                <div className='mt-6 border-t border-line pt-5'>
                  <Label>New words you used</Label>
                  <div className='flex flex-wrap gap-2'>
                    {[
                      'to negotiate',
                      'deadline',
                      'to postpone',
                      'on second thought',
                    ].map((w) => (
                      <span
                        key={w}
                        className='rounded-full border border-brand-line bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-deep'
                      >
                        {w}
                      </span>
                    ))}
                  </div>
                </div>

                <div className='mt-5'>
                  <Label>Areas to improve</Label>
                  <ul className='flex flex-col gap-1.5 text-[.97rem] text-ink'>
                    <li className='flex gap-2.5'>
                      <span className='text-brand-deep'>→</span> Articles before
                      abstract nouns (&ldquo;advice&rdquo;, not &ldquo;the
                      advice&rdquo;)
                    </li>
                    <li className='flex gap-2.5'>
                      <span className='text-brand-deep'>→</span> The{' '}
                      <em className='not-italic font-semibold'>/θ/</em> sound in
                      &ldquo;think&rdquo; &amp; &ldquo;through&rdquo;
                    </li>
                  </ul>
                </div>

                <div className='mt-5'>
                  <Label>You did brilliantly at</Label>
                  <span className='inline-block rounded-full border border-mint/25 bg-mint/12 px-3 py-1.5 text-sm font-medium text-[#137e70]'>
                    Past-tense storytelling
                  </span>
                </div>

                <p className='mt-auto pt-6 font-display text-lg italic text-ink-soft'>
                  Keep it up — see you next lesson 👋
                </p>
              </div>
            </article>
          </Reveal>

          {/* ---- TUTOR: private ruled notebook ---- */}
          <Reveal delay={160}>
            <article className='group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white shadow-soft-md transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg'>
              {/* ruled paper */}
              <div
                className='pointer-events-none absolute inset-0 opacity-70'
                style={{
                  background:
                    'repeating-linear-gradient(to bottom, transparent 0, transparent 33px, var(--color-line) 33px, var(--color-line) 34px)',
                }}
              />
              {/* margin line */}
              <div className='pointer-events-none absolute bottom-0 left-14 top-0 w-px bg-amber/45' />
              {/* private tab */}
              <div className='absolute right-6 top-6 rounded-md bg-ink px-2.5 py-1 text-[.66rem] font-bold uppercase tracking-wider text-white/90'>
                Private
              </div>

              <div className='relative flex flex-1 flex-col p-8 pl-[76px]'>
                <div className='mb-6 flex items-center gap-2.5 text-sm text-ink-soft'>
                  <span className='grid h-8 w-8 place-items-center rounded-lg bg-mint/15 text-[#137e70]'>
                    <svg
                      width='16'
                      height='16'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M12 20h9' />
                      <path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z' />
                    </svg>
                  </span>
                  Only you see these
                </div>

                <h3 className='font-display text-2xl font-medium text-ink'>
                  Tutor notes
                </h3>

                <div className='mt-6 flex flex-col gap-4 text-[.97rem] leading-[34px] text-ink'>
                  <div className='rounded-lg bg-brand-soft px-3 py-1.5 font-medium text-brand-deep'>
                    → Next lesson: role-play negotiating a deadline
                  </div>
                  <p>
                    <span className='text-muted'>—</span> Recurring: drops
                    articles before abstract nouns
                  </p>
                  <p>
                    <span className='text-muted'>—</span> Progress: confident
                    with tenses, ready for B2 reading
                  </p>
                  <p>
                    <span className='text-muted'>—</span> Watch:{' '}
                    <mark className='rounded bg-amber/25 px-1 text-ink'>
                      /θ/ vs /s/
                    </mark>{' '}
                    still inconsistent
                  </p>
                  <p>
                    <span className='text-muted'>—</span> Loves travel &amp;
                    food topics — use for vocab
                  </p>
                </div>

                <p className='mt-auto pt-6 text-sm text-muted'>
                  Saved to Maria&apos;s journey · builds on 11 past lessons
                </p>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
