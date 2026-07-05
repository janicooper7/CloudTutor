# CloudTutor — MVP Plan

A **web app + companion browser extension** for **1-on-1 online language tutors**.
Because it captures the browser tab's audio (not any single platform's API), it works
with **any browser-based lesson** — Google Meet, Zoom (web), Preply, italki, Cambly,
Microsoft Teams (web), Skype, and more. Tutors discover and subscribe on the website,
install a thin extension that captures lesson audio, and manage everything (students,
feedback, journey, billing) in the web dashboard. The tool generates reviewable feedback
and tracks each student's learning journey over time.

Status: **planning**. Last updated: 2026-07-02.

---

## Design direction

The visual identity for the website and dashboard (use the `/frontend-design` skill when building):

- **Palette:** light blue as the primary color — soft, airy, trustworthy. Light background,
  gentle blue accents, avoid heavy/dark or high-contrast blocks.
- **Spacing:** generous whitespace around every element; let components breathe. Roomy
  padding and margins over dense layouts.
- **Components:** clean, simple, easy to read. Clear type hierarchy, calm surfaces, minimal
  visual noise.
- **Interaction:** plenty of smooth, subtle motion — hover states, transitions, and micro
  interactions that feel polished (nothing jarring or flashy).
- **Feel:** calm, modern, professional — a tool tutors trust and enjoy using daily.

---

## 0. Product shape (website-first)

Three surfaces, with the **website as the hub** and the extension as a thin companion
(model: Grammarly / Otter / Loom).

1. **Public marketing website** — landing page, "how it works", demo walkthrough video +
   sample report, **pricing/subscription**, sign up / log in.
2. **Web app / dashboard** (logged-in area of the same site) — manage students & profiles,
   review/edit/confirm sessions, send PDFs, per-student journey, **billing**, and an
   "install the extension" + connection-status panel.
3. **Browser extension** (companion, installed from the site) — **signs in to the tutor's
   account**, checks subscription, and does only what must happen in the browser: **capture
   tab + mic audio** during the call and upload it. All heavy lifting (STT, AI, storage,
   dashboard) lives in the web app / backend, keeping the extension thin.

Billing: **Stripe** subscriptions; the extension refuses to capture if the account isn't
on an active plan.

---

## 1. Product summary

- **User:** the tutor (single user type for MVP — no student logins).
- **Domain:** English language tutoring, 1-on-1.
- **Value:** after each lesson, the tutor gets two AI-generated, editable outputs —
  one for the student (emailed as a PDF) and one private set of teaching notes — plus
  a running per-student journey that makes suggestions smarter every session.

---

## 2. The core loop

1. Tutor starts a 1:1 lesson in **any browser-based platform** (Meet, Zoom web, Preply, italki…).
2. Extension captures **two audio streams**: tutor mic (= tutor) + tab audio (= student).
3. Call ends → audio uploaded → transcribed → **audio & transcript discarded**.
4. Claude analyzes the labeled transcript against the student's history → generates a **draft**.
5. Tutor reviews/edits, **confirms**.
6. Student feedback → **PDF emailed** to student. Tutor feedback → saved to the student's journey.

---

## 3. Tutor vs student separation (key design decision)

Because it's **1:1**, we avoid fragile AI diarization by capturing two labeled streams:

- **Tutor mic** (`getUserMedia`) → labeled **Tutor**
- **Tab audio** (`chrome.tabCapture`) → labeled **Student** (the remote participant)

Each stream is transcribed separately, interleaved by timestamp, and handed to Claude as a
clean `Tutor: … / Student: …` transcript. This clean split is only possible because scope
is 1:1 — group classes would require real diarization (deferred).

**Platform-agnostic by design.** Capturing tab audio (rather than a platform API) means
this works on *any* browser-based lesson — Meet, Zoom web, Preply, italki, Cambly, Teams
web, Skype — with no per-platform integration. The tutor/student split holds everywhere
because it relies on browser audio routing (remote audio → tab, tutor → mic), not on any
platform's internals. This deliberately widens the market to Preply/italki tutors who
can't use Zoom-only tools.

---

## 4. The two outputs per session

### Student feedback (emailed PDF) — warm, actionable
- New **vocabulary** from the session (word + meaning + example as used)
- What they did **well** (encouragement)
- **Areas to improve** before the next lesson

> Terminology: this "weaknesses / what to work on" concept is labelled **"Areas to improve"**
> consistently across the whole product (hero, session review, student profile, add-student form).

### Tutor feedback (private, in dashboard)
- **Suggestions for the next lesson** (topics, drills)
- **Recurring weaknesses** across sessions
- Where the student is **progressing / plateauing**
- Prep notes for continuity

---

## 5. Per-student journey (the moat)

The tool remembers across sessions, so guidance is grounded in real history:

- **Cumulative vocabulary bank** per student (introduced vs recurring)
- **Recurring error patterns** (grammar / pronunciation themes that keep appearing)
- **Level trajectory** + **suggested learning path** ("next: past tense + phrasal verbs")

Each new session's analysis is fed the student's prior journey, so "what to focus on /
learn next" reflects the student's actual trajectory, not a one-off guess.

---

## 6. Student profile

Captured when the tutor creates a student. Only **Name** is required; everything else is
optional but each field measurably improves feedback quality.

- **Name** (required)
- **Native language (L1)** — biggest lever; lets Claude anticipate typical L1 error patterns
- **Current level** — CEFR A1–C2
- **Primary goal** — conversational / business English / exam prep / travel / academic
- **Target exam + date** (optional) — IELTS / TOEFL / etc.
- **Interests / topics** — makes vocabulary and examples relevant and engaging
- **Areas to improve** — tutor's starting notes on weaknesses
- **Start date / cadence** (optional)

---

## 7. Architecture

- **Browser extension** (Chrome, Manifest V3): audio capture (tab + mic via `MediaRecorder`),
  consent toggle + "session is being analyzed" notice, "process session" action. Uploads
  audio when the call ends.
- **Backend** (Node/TypeScript + Postgres, multi-tenant): receives audio, orchestrates
  STT → Claude → stores results.
- **Speech-to-text:** dedicated STT service (Deepgram or AssemblyAI — cheap, accurate on
  English). Claude does not transcribe audio, so this is a separate step.
- **LLM analysis:** **Claude (Sonnet 5)** produces structured JSON (student feedback +
  tutor feedback + vocab + journey updates).
- **Marketing website** (public): landing, how-it-works, demo walkthrough video + sample
  report, pricing. Same codebase as the web app.
- **Web app / dashboard** (React, logged-in area): student list, session review/edit/confirm,
  journey view, "send PDF" action, billing, and an "install extension" + connection panel.
- **Billing:** Stripe subscriptions; extension enforces active-plan before capture.
- **PDF + email:** render PDF, send via Resend / SendGrid.
- **Auth:** Google OAuth (tutors already have Google accounts); extension authenticates
  against the same account.

---

## 8. Data model (sketch)

- `Tutor` (account) → many `Student`
- `Student` → profile fields (see §6) → many `Session`
- `Session` → date, status (`draft` / `confirmed` / `sent`), studentFeedback, tutorFeedback,
  vocab[], focusAreas[]
- **Journey** = derived aggregate across a student's sessions

---

## 9. Privacy (aligned to "notes only")

- Audio + transcript are **transient** — used for processing, then deleted. Only structured
  **notes** persist.
- Explicit **consent notice** the tutor enables; recommend a one-time student consent
  checkbox (recording-consent laws vary by region).

---

## 10. Out of scope for MVP (deferred, but designed around)

- **Desktop apps** (Zoom, Preply, etc.) — browser-only for now
- **Group classes** (breaks the clean two-stream separation)
- **Real-time** in-call hints (post-call only)
- **Student logins** (tutor delivers the PDF)
- Languages **other than English**

---

## 11. Biggest risks to validate early

1. **Tab-audio capture UX** on Meet / Zoom web — ensure the tutor still hears audio while we
   capture it. Build a throwaway prototype of just this first.
2. **STT accuracy on accented English** — students are learners with heavy accents; test real samples.
3. **Consent / legal** in the tutors' regions.

---

## 12. Suggested build order

1. **Spike:** extension that captures tab + mic and saves two `.webm` files (de-risks #1).
2. STT + Claude pipeline on those files → labeled transcript → structured JSON.
3. Minimal web app: one student, review/edit/confirm one session.
4. Per-student journey + history feeding back into analysis.
5. PDF + email delivery.
6. Auth + multi-tenant + extension sign-in.
7. Marketing site (landing + demo video + sample report) + Stripe subscriptions + gating.
