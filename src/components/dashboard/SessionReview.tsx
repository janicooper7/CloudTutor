"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import StatusBadge from "./StatusBadge";
import type { Session, SessionStatus, Student, VocabItem } from "@/lib/mock";
import { deleteSession, saveSessionFeedback, sendLessonReport } from "@/app/actions/sessions";

export default function SessionReview({
  session,
  student,
}: {
  session: Session;
  student?: Student;
}) {
  const router = useRouter();
  const [vocab, setVocab] = useState<VocabItem[]>(session.vocab);
  const [wentWell, setWentWell] = useState<string[]>(session.wentWell);
  const [focus, setFocus] = useState<string[]>(session.focus);
  const [homework, setHomework] = useState(session.homework);
  const [additionalInfo, setAdditionalInfo] = useState(session.additionalInfo);
  const [nextLesson, setNextLesson] = useState<string[]>(session.nextLesson);
  const [lessonEndedAt, setLessonEndedAt] = useState(session.lessonEndedAt);
  const [notes, setNotes] = useState(session.tutorNotes);
  const [saved, setSaved] = useState<null | string>(null);
  const [flashTone, setFlashTone] = useState<"ok" | "err">("ok");
  const [status, setStatus] = useState<SessionStatus>(session.status);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const title = session.title;
  const sent = status === "sent";
  const missingEmail = !student?.email;

  function flash(msg: string, tone: "ok" | "err" = "ok") {
    setSaved(msg);
    setFlashTone(tone);
    setTimeout(() => setSaved(null), tone === "err" ? 5000 : 2200);
  }

  const feedback = () => ({
    vocab,
    wentWell,
    focus,
    homework,
    additionalInfo,
    nextLesson,
    lessonEndedAt,
    tutorNotes: notes,
  });

  async function save(target: SessionStatus) {
    setSaving(true);
    try {
      if (target === "sent") {
        const result = await sendLessonReport(session.id, feedback());
        if (!result.ok) {
          flash(result.error, "err");
          return;
        }
      } else {
        await saveSessionFeedback(session.id, feedback(), target);
      }
      setStatus(target);
      if (target === "sent") {
        flash(`Feedback PDF sent to ${session.studentName.split(" ")[0]}.`);
        if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        flash("Draft saved.");
      }
      router.refresh();
    } catch (err) {
      flash(
        err instanceof Error && err.message ? err.message : "Couldn't save — please try again.",
        "err",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      // deleteSession redirects to /dashboard on success, so control won't
      // return here in the happy path.
      await deleteSession(session.id);
    } catch (err) {
      flash(
        err instanceof Error && err.message ? err.message : "Couldn't delete — please try again.",
        "err",
      );
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="px-6 py-8 lg:px-10">
      <Link href="/dashboard" className="text-sm font-medium text-brand-deep hover:underline">
        ← Back to overview
      </Link>

      {/* success banner */}
      {sent && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-mint/30 bg-mint/10 p-4">
          <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-mint text-white">✓</span>
          <div>
            <div className="font-semibold text-[#137e70]">Sent to {session.studentName}</div>
            <div className="text-sm text-[#2b8a7c]">
              The student feedback PDF was emailed. Tutor notes saved to their journey.
            </div>
          </div>
        </div>
      )}

      {/* header */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6 shadow-soft-sm">
        <div className="flex items-center gap-4">
          <Avatar initial={session.studentInitial} size={56} />
          <div>
            <div className="font-display text-xl font-medium text-ink">{title}</div>
            <div className="text-sm text-muted">
              {session.studentName} · {session.date} · {session.durationMin} min
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-deep">
            {session.levelFrom} → {session.levelTo}
          </span>
          <StatusBadge status={status} />
        </div>
      </div>

      <p className="mt-4 flex items-center gap-2 text-sm text-muted">
        <span className="grid h-5 w-5 place-items-center rounded-md bg-brand-soft text-[.7rem] text-brand-deep">i</span>
        AI-drafted from the lesson. Review and edit anything below — audio was discarded after processing.
      </p>

      {/* context: key student info (tutor reference) */}
      <div className="mt-6 rounded-2xl border border-line bg-surface p-6 shadow-soft-sm">
        <SectionLabel>Key student information</SectionLabel>
        {student ? (
          <dl className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
            <InfoRow k="Goal" v={student.goal} />
            <InfoRow k="Native language" v={student.native} />
            <InfoRow k="Working level" v={student.level} />
            {student.targetExam && <InfoRow k="Target exam" v={student.targetExam} />}
            {student.focus.length > 0 && (
              <InfoRow k="Focus areas" v={student.focus.join(" · ")} />
            )}
          </dl>
        ) : (
          <p className="text-sm text-muted">No student profile linked.</p>
        )}
      </div>

      {/* two feedbacks */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* student feedback */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft-sm">
          <div className="border-b border-line bg-brand-soft/40 px-6 py-4">
            <div className="text-xs font-bold uppercase tracking-wide text-brand-deep">
              For the student · emailed PDF
            </div>
            <div className="font-display text-lg font-medium text-ink">Student feedback</div>
          </div>
          <div className="flex flex-col gap-6 p-6">
            <div className="rounded-xl border border-brand-line bg-brand-soft/30 p-4">
              <div className="mb-3 flex items-center justify-between">
                <SectionLabel>Lesson metrics</SectionLabel>
                <span className="text-[0.65rem] font-medium uppercase tracking-wide text-muted">
                  Measured from the lesson
                </span>
              </div>
              <TalkTimeMeter studentPct={session.talkTime.student} />
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-brand-line/60 pt-3">
                <span className="text-sm font-medium text-ink-soft">Observed level this lesson</span>
                <span className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-brand-deep">
                  {session.observedLevel}
                </span>
              </div>
            </div>
            <VocabEditor vocab={vocab} setVocab={setVocab} disabled={sent} />
            <ListEditor
              title="Went well"
              tone="mint"
              items={wentWell}
              setItems={setWentWell}
              disabled={sent}
              placeholder="Something they did well…"
            />
            <ListEditor
              title="Areas to improve"
              tone="amber"
              items={focus}
              setItems={setFocus}
              disabled={sent}
              placeholder="An area to improve…"
            />
            <div>
              <SectionLabel>Homework</SectionLabel>
              <textarea
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                disabled={sent}
                rows={3}
                placeholder="Suggest a task to practise before next lesson…"
                className="w-full resize-y rounded-xl border border-amber/30 bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-amber focus:ring-4 focus:ring-amber/20 disabled:opacity-70"
              />
            </div>
            <div>
              <SectionLabel>Additional information</SectionLabel>
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                disabled={sent}
                rows={3}
                placeholder="Anything else to pass on to the student…"
                className="w-full resize-y rounded-xl border border-brand-line bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-70"
              />
            </div>
          </div>
        </div>

        {/* tutor notes */}
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft-sm">
          <div className="border-b border-line bg-mint/10 px-6 py-4">
            <div className="text-xs font-bold uppercase tracking-wide text-[#137e70]">
              For you · private notes
            </div>
            <div className="font-display text-lg font-medium text-ink">Tutor notes</div>
          </div>
          <div className="flex flex-col gap-6 p-6">
            <div>
              <SectionLabel>Where the lesson ended</SectionLabel>
              <textarea
                value={lessonEndedAt}
                onChange={(e) => setLessonEndedAt(e.target.value)}
                disabled={sent}
                rows={2}
                placeholder="Where in the material you stopped…"
                className="w-full resize-y rounded-xl border border-mint/30 bg-white px-4 py-3 text-sm text-ink outline-none transition-all focus:border-mint focus:ring-4 focus:ring-mint/15 disabled:opacity-70"
              />
            </div>
            <ListEditor
              title="Suggestions for next lesson"
              tone="brand"
              items={nextLesson}
              setItems={setNextLesson}
              disabled={sent}
              placeholder="An idea for next time…"
            />
            <div>
              <SectionLabel>Prep notes</SectionLabel>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={sent}
                rows={5}
                className="w-full resize-y rounded-xl border border-brand-line bg-white px-4 py-3 text-ink outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-70"
              />
            </div>
          </div>
        </div>
      </div>

      {/* actions */}
      {!sent && missingEmail && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber/30 bg-amber/10 p-4">
          <div className="text-sm font-medium text-[#b5791f]">
            No email on file for {session.studentName} — add one to send the report.
          </div>
          <Link
            href={`/dashboard/students/${session.studentId}`}
            className="rounded-lg border border-amber/40 bg-white/70 px-3.5 py-2 text-sm font-semibold text-[#b5791f] transition-colors hover:bg-white"
          >
            Add email →
          </Link>
        </div>
      )}

      <div className="sticky bottom-4 mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface/90 p-4 shadow-soft-md backdrop-blur">
        <div className="flex items-center gap-3">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#d9534f]">Delete this lesson?</span>
              <button
                onClick={remove}
                disabled={deleting}
                className="rounded-lg bg-[#d9534f] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#c33] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="rounded-lg border border-line px-3.5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={saving}
              className="rounded-xl border border-line px-4 py-3 font-semibold text-muted transition-colors hover:border-[#e77] hover:text-[#d9534f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Delete
            </button>
          )}
        </div>
        <div
          className={`min-h-[1.25rem] flex-1 text-right text-sm font-medium ${
            flashTone === "err" ? "text-[#d9534f]" : "text-mint"
          }`}
        >
          {saved}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => save("confirmed")}
            disabled={sent || saving}
            className="rounded-xl border border-brand-line bg-white/70 px-5 py-3 font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-brand disabled:cursor-not-allowed disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            onClick={() => save("sent")}
            disabled={sent || saving || missingEmail}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-deep px-6 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ boxShadow: "0 10px 24px -10px rgba(31,110,224,.7)" }}
          >
            {sent ? "Sent ✓" : saving ? "Sending…" : "Confirm & send to student →"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-xs font-bold uppercase tracking-wide text-muted">{children}</div>
  );
}

function InfoRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-ink-soft">{k}</dt>
      <dd className="text-right font-semibold text-ink">{v}</dd>
    </div>
  );
}

function TalkTimeMeter({ studentPct }: { studentPct: number }) {
  const tutorPct = 100 - studentPct;
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span className="text-brand-deep">Student {studentPct}%</span>
        <span className="text-[#137e70]">Tutor {tutorPct}%</span>
      </div>
      <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-brand-soft">
        <div className="bg-brand-deep" style={{ width: `${studentPct}%` }} />
        <div className="bg-mint" style={{ width: `${tutorPct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">Share of speaking time during the lesson.</p>
    </div>
  );
}

const toneRing: Record<string, string> = {
  brand: "focus:border-brand focus:ring-brand/15 border-brand-line",
  mint: "focus:border-mint focus:ring-mint/15 border-mint/30",
  amber: "focus:border-amber focus:ring-amber/20 border-amber/30",
};

function ListEditor({
  title,
  items,
  setItems,
  tone,
  placeholder,
  disabled,
}: {
  title: string;
  items: string[];
  setItems: (v: string[]) => void;
  tone: "brand" | "mint" | "amber";
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <SectionLabel>{title}</SectionLabel>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={item}
              disabled={disabled}
              placeholder={placeholder}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                setItems(next);
              }}
              className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:ring-4 disabled:opacity-70 ${toneRing[tone]}`}
            />
            {!disabled && (
              <button
                onClick={() => setItems(items.filter((_, j) => j !== i))}
                className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-line text-muted transition-colors hover:border-[#e77] hover:text-[#d9534f]"
                aria-label="Remove"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      {!disabled && (
        <button
          onClick={() => setItems([...items, ""])}
          className="mt-2 text-sm font-semibold text-brand-deep hover:underline"
        >
          + Add
        </button>
      )}
    </div>
  );
}

function VocabEditor({
  vocab,
  setVocab,
  disabled,
}: {
  vocab: VocabItem[];
  setVocab: (v: VocabItem[]) => void;
  disabled?: boolean;
}) {
  function update(i: number, key: keyof VocabItem, value: string) {
    const next = vocab.map((v, j) => (j === i ? { ...v, [key]: value } : v));
    setVocab(next);
  }
  return (
    <div>
      <SectionLabel>New vocabulary</SectionLabel>
      <div className="flex flex-col gap-3">
        {vocab.map((v, i) => (
          <div key={i} className="rounded-xl border border-brand-line bg-white/60 p-3">
            <div className="flex items-center gap-2">
              <input
                value={v.term}
                disabled={disabled}
                placeholder="term"
                onChange={(e) => update(i, "term", e.target.value)}
                className="w-2/5 rounded-lg border border-brand-line bg-white px-3 py-2 text-sm font-semibold text-ink outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-70"
              />
              <input
                value={v.meaning}
                disabled={disabled}
                placeholder="meaning"
                onChange={(e) => update(i, "meaning", e.target.value)}
                className="w-3/5 rounded-lg border border-brand-line bg-white px-3 py-2 text-sm text-ink-soft outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-70"
              />
              {!disabled && (
                <button
                  onClick={() => setVocab(vocab.filter((_, j) => j !== i))}
                  className="grid h-9 w-9 flex-none place-items-center rounded-lg border border-line text-muted transition-colors hover:border-[#e77] hover:text-[#d9534f]"
                  aria-label="Remove"
                >
                  ×
                </button>
              )}
            </div>
            <input
              value={v.example}
              disabled={disabled}
              placeholder="Example sentence from the lesson…"
              onChange={(e) => update(i, "example", e.target.value)}
              className="mt-2 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm italic text-ink-soft outline-none transition-all focus:border-brand focus:ring-4 focus:ring-brand/15 disabled:opacity-70"
            />
          </div>
        ))}
      </div>
      {!disabled && (
        <button
          onClick={() => setVocab([...vocab, { term: "", meaning: "", example: "" }])}
          className="mt-2 text-sm font-semibold text-brand-deep hover:underline"
        >
          + Add word
        </button>
      )}
    </div>
  );
}
