"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import SessionRecorder from "./SessionRecorder";
import StatusBadge from "./StatusBadge";
import { ChevronRightIcon } from "./icons";
import { sortSessions, splitLessonTitle, type Session, type Student } from "@/lib/mock";
import {
  deleteStudent,
  setStudentActive,
  setStudentEmail,
  setStudentNotes,
} from "@/app/actions/students";
import { setSessionTitle } from "@/app/actions/sessions";

export default function StudentDetailView({
  student,
  initialHistory,
}: {
  student: Student;
  initialHistory: Session[];
}) {
  const router = useRouter();
  // Server props are the source of truth; local state gives snappy optimistic
  // updates while the Server Actions persist + revalidate in the background.
  const [active, setActive] = useState(student.active !== false);
  const [email, setEmail] = useState(student.email ?? "");
  const [emailSaved, setEmailSaved] = useState(false);
  const [notes, setNotes] = useState(student.notes ?? "");
  const [history, setHistory] = useState<Session[]>(initialHistory);
  const [notesSaved, setNotesSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteStudent(student.id);
      router.push("/dashboard/students");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  }

  function toggleActive() {
    const next = !active;
    setActive(next);
    void setStudentActive(student.id, next);
  }

  async function saveNotes() {
    await setStudentNotes(student.id, notes);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  }

  async function saveEmail() {
    if (email.trim() === (student.email ?? "")) return;
    await setStudentEmail(student.id, email);
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2000);
  }

  function saveTitle(sessionId: string) {
    const topic = editTitle.trim();
    if (topic) {
      const current = history.find((s) => s.id === sessionId);
      const label = current ? splitLessonTitle(current.title).label : "";
      const full = label ? `${label} · ${topic}` : topic;
      setHistory((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: full } : s)));
      void setSessionTitle(sessionId, full);
    }
    setEditingId(null);
  }

  const firstName = student.name.split(" ")[0];
  const sortedHistory = sortSessions(history, "date");
  // Most recent lesson drives the warm-up suggestion.
  const latestLesson = sortSessions(history, "date")[0];
  const warmUpTerms = latestLesson?.vocab.map((v) => v.term).filter(Boolean).slice(0, 3) ?? [];

  return (
    <div className="px-6 py-8 lg:px-10">
      <Link href="/dashboard/students" className="text-sm font-medium text-brand-deep hover:underline">
        ← All students
      </Link>

      {active && (
        <div className="mt-4">
          <SessionRecorder studentId={student.id} studentName={student.name} />
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.5fr]">
        {/* profile */}
        <section className="h-fit rounded-2xl border border-line bg-surface p-6 shadow-soft-sm">
          <div className="flex items-center gap-4">
            <Avatar initial={student.initial} size={60} />
            <div>
              <div className="font-display text-xl font-medium text-ink">{student.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="inline-block rounded-full bg-brand-soft px-2.5 py-1 text-xs font-semibold text-brand-deep">
                  {student.level}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    active ? "bg-mint/14 text-[#137e70]" : "bg-line text-ink-soft"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-mint" : "bg-muted"}`} />
                  {active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={toggleActive}
            className="mt-4 w-full rounded-xl border border-line bg-white/70 px-4 py-2.5 text-sm font-semibold text-ink-soft transition-all duration-200 hover:-translate-y-0.5 hover:text-ink"
          >
            {active ? "Mark as inactive" : "Mark as active"}
          </button>

          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Email</div>
              {emailSaved && <span className="text-xs font-semibold text-mint">Saved ✓</span>}
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={saveEmail}
              placeholder="student@email.com"
              className="mt-2 w-full rounded-xl border border-brand-line bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
            <p className="mt-1.5 text-xs text-muted">Where lesson-report PDFs are sent.</p>
          </div>

          <dl className="mt-6 flex flex-col gap-3.5 text-sm">
            <Row k="Goal" v={student.goal} />
            <Row k="Native language" v={student.native} />
            {student.targetExam && <Row k="Target exam" v={student.targetExam} />}
            <Row k="Lessons taught" v={String(student.lessonCount)} />
            <Row k="Vocabulary bank" v={`${student.vocabCount} words`} />
            <Row k="Last lesson" v={student.lastSeen} />
          </dl>

          {student.interests && student.interests.length > 0 && (
            <div className="mt-6 border-t border-line pt-5">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Interests</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {student.interests.map((t) => (
                  <span key={t} className="rounded-full border border-brand-line bg-brand-soft px-3 py-1.5 text-sm font-medium text-brand-deep">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-line pt-5">
            <div className="text-xs font-bold uppercase tracking-wide text-muted">Areas to improve</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {student.focus.length > 0 ? (
                student.focus.map((f) => (
                  <span key={f} className="rounded-full border border-amber/25 bg-amber/12 px-3 py-1.5 text-sm font-medium text-[#b5791f]">
                    {f}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted">Set after the first lesson.</span>
              )}
            </div>
          </div>

          {/* tutor notes */}
          <div className="mt-6 border-t border-line pt-5">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wide text-muted">Notes</div>
              {notesSaved && <span className="text-xs font-semibold text-mint">Saved ✓</span>}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              rows={4}
              placeholder="Anything you want to remember about this student…"
              className="mt-3 w-full resize-y rounded-xl border border-brand-line bg-white px-3.5 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15"
            />
          </div>

          {/* delete */}
          <div className="mt-6 border-t border-line pt-5">
            {confirming ? (
              <div className="rounded-xl border border-[#f0c4c2] bg-[#fdf1f1] p-4">
                <p className="text-sm font-medium text-[#a23b38]">
                  Delete {student.name}? This removes their profile and history from your roster.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </button>
                  <button
                    onClick={() => setConfirming(false)}
                    className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-semibold text-[#c0524e] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#f0c4c2] hover:bg-[#fdf1f1] hover:text-[#a23b38]"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M3 6h18" />
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                Delete student
              </button>
            )}
          </div>
        </section>

        {/* journey + sessions */}
        <div className="flex flex-col gap-6">
          <section
            className="relative overflow-hidden rounded-2xl p-6 text-white shadow-soft-sm"
            style={{ background: "linear-gradient(150deg,#123a6b,#1f6ee0)" }}
          >
            <div className="text-xs font-bold uppercase tracking-wide text-[#bcd8fb]">Suggested next</div>
            <h2 className="mt-2 font-display text-xl font-medium">Where to take {firstName} next</h2>
            <p className="mt-2 text-[#dbe9fd]">
              {history.length === 0 ? (
                <>Record your first lesson with {firstName} and CloudTutor will start building their journey — vocabulary, areas to improve, and what to work on next.</>
              ) : (
                <>Based on {student.lessonCount} lessons, CloudTutor recommends focusing on{" "}
                <span className="font-semibold text-white">{student.focus[0]}</span> before moving
                deeper into {student.goal.toLowerCase()} material.</>
              )}
            </p>

            {warmUpTerms.length > 0 && (
              <div className="mt-4 rounded-xl border border-white/15 bg-white/10 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-[#bcd8fb]">
                  Warm-up exercise
                </div>
                <p className="mt-1.5 text-[#eaf2fe]">
                  Recap last lesson: ask {firstName} to make a sentence with{" "}
                  {warmUpTerms.map((t, i) => (
                    <span key={t} className="font-semibold text-white">
                      &ldquo;{t}&rdquo;
                      {i < warmUpTerms.length - 1 ? (i === warmUpTerms.length - 2 ? " and " : ", ") : ""}
                    </span>
                  ))}
                  .
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6 shadow-soft-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-xl font-medium text-ink">Lesson history</h2>
            </div>
            <div className="flex flex-col gap-3">
              {sortedHistory.map((s) => {
                const { label, topic } = splitLessonTitle(s.title);
                const meta = [label, `${s.durationMin} min`, `${s.vocab.length} new words`]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <div
                    key={s.id}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-white/60 p-4 transition-all duration-200 hover:border-brand-line hover:shadow-soft-sm"
                  >
                    {editingId === s.id ? (
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <input
                          autoFocus
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTitle(s.id);
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          className="w-full rounded-lg border border-brand-line bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
                        />
                        <button
                          onClick={() => saveTitle(s.id)}
                          className="flex-none rounded-lg bg-brand-deep px-3 py-2 text-xs font-semibold text-white transition-transform hover:-translate-y-0.5"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex-none rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink-soft transition-colors hover:text-ink"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link href={`/dashboard/sessions/${s.id}`} className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-ink">{s.date} · {topic}</div>
                          <div className="text-xs text-muted">{meta}</div>
                        </Link>
                        <button
                          onClick={() => { setEditingId(s.id); setEditTitle(topic); }}
                          className="flex-none rounded-lg border border-transparent p-2 text-muted opacity-0 transition-all duration-200 hover:border-brand-line hover:text-brand-deep group-hover:opacity-100"
                          aria-label="Rename lesson"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
                          </svg>
                        </button>
                        <StatusBadge status={s.status} />
                        <Link href={`/dashboard/sessions/${s.id}`} aria-label="Open lesson" className="flex-none">
                          <ChevronRightIcon className="text-muted transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-deep" />
                        </Link>
                      </>
                    )}
                  </div>
                );
              })}
              {history.length === 0 && <p className="text-sm text-muted">No lessons recorded yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="text-right font-semibold text-ink">{v}</dd>
    </div>
  );
}
