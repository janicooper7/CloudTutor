"use client";

import { useState } from "react";
import { deleteAccount } from "@/app/actions/tutor";

/**
 * The account-deletion card. Rendered last on the settings page — it's the most
 * destructive control there, so nothing sits below it to be mis-clicked past.
 */
export default function DeleteAccountCard({
  email,
  studentCount,
  lessonCount,
}: {
  email: string;
  studentCount: number;
  lessonCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typing the email is deliberate friction: this wipes every student and
  // lesson, and there is no undo.
  const matches = confirm.trim().toLowerCase() === email.toLowerCase();

  async function handleDelete() {
    if (!matches) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (err) {
      // A successful delete redirects, which surfaces as a thrown control-flow
      // signal — re-throw it and only report anything that isn't that.
      if (isRedirectError(err)) throw err;
      setDeleting(false);
      setError("Something went wrong deleting your account. Please try again.");
    }
  }

  const losing = [
    `${studentCount} student ${studentCount === 1 ? "profile" : "profiles"}`,
    `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`,
  ].join(" and ");

  return (
    <div className="mt-6 rounded-2xl border border-[#f0c4c2] bg-[#fdf1f1]/60 p-6 shadow-soft-sm">
      <div className="font-semibold text-[#a23b38]">Delete account</div>
      <p className="mt-1.5 text-sm text-ink-soft">
        Permanently removes your account along with {losing}. This can&rsquo;t be undone.
      </p>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#f0c4c2] bg-white/70 px-4 py-2.5 text-sm font-semibold text-[#c0524e] transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-[#a23b38]"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
          Delete my account
        </button>
      ) : (
        <div className="mt-4 rounded-xl border border-[#f0c4c2] bg-white/80 p-4">
          <label htmlFor="delete-confirm" className="text-sm font-medium text-[#a23b38]">
            Type <span className="font-semibold">{email}</span> to confirm.
          </label>
          <input
            id="delete-confirm"
            autoFocus
            autoComplete="off"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={email}
            className="mt-2.5 w-full rounded-xl border border-[#f0c4c2] bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition-all focus:border-[#d9534f] focus:ring-4 focus:ring-[#d9534f]/20"
          />
          {error && <p className="mt-2 text-xs font-medium text-[#a23b38]">{error}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={handleDelete}
              disabled={!matches || deleting}
              className="rounded-lg bg-[#d9534f] px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-50"
            >
              {deleting ? "Deleting…" : "Delete everything"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setConfirm("");
                setError(null);
              }}
              disabled={deleting}
              className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink-soft transition-colors hover:text-ink disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function isRedirectError(err: unknown): boolean {
  return typeof (err as { digest?: unknown })?.digest === "string" &&
    (err as { digest: string }).digest.startsWith("NEXT_REDIRECT");
}
