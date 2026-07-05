# CloudTutor Capture

A Chrome (MV3) extension that records a 1-on-1 lesson and uploads it to CloudTutor,
which transcribes it and drafts the lesson automatically.

It records **tab audio (the student)** and **the tutor's microphone** as two separate
tracks — with no platform-specific integration — so you get clean speaker separation
without any AI diarization.

## Why two separate tracks?

For a 1-on-1 browser call the two speakers are already physically separate:

- **Tab audio** = the remote participant = **the student**
- **Local microphone** = **the tutor**

Because it captures the **tab's audio output** (not a Zoom/Meet API), it works on **any
browser-based lesson platform** — Google Meet, Zoom (web), Preply Classroom, italki,
Cambly, Teams (web), etc.

## Load it in Chrome

1. Go to `chrome://extensions`.
2. Turn on **Developer mode** (top right).
3. Click **Load unpacked** and select this `extension/` folder.
4. Pin the **CloudTutor Capture** icon to your toolbar.

## Connect it to your account

1. In CloudTutor, open **Settings → Lesson capture**.
2. Copy the **App URL** (e.g. `http://localhost:3000`) and generate a **capture token**.
3. Open the extension, paste both into the connection screen, and **Save & connect**.

The token authenticates uploads to your account — treat it like a password. You can
regenerate it any time from Settings (which immediately invalidates the old one).

## Record a lesson

1. Open your lesson tab (Meet/Zoom/Preply…) — **get the student's consent to record**.
2. Click the extension icon, pick the **student**, and hit **Start recording**.
3. Grant **microphone** permission when prompted (first time only).
4. When the lesson ends, click **Stop & upload**.
5. The two tracks upload; CloudTutor transcribes them, generates the feedback, and
   creates a **draft lesson**. The popup shows a link to open it, and it also appears in
   your dashboard review queue.

## How it works

- **popup** — connection settings, student picker, and the record controls. Holds the
  user gesture: requests mic permission and gets a tab-capture `streamId`.
- **background.js** (service worker) — manages the offscreen document's lifecycle and
  stashes the upload result for the popup.
- **offscreen.js** — a hidden page that owns the two `MediaRecorder`s (so recording
  continues after the popup closes), routes tab audio back to the speakers so the tutor
  can still hear the student, and on stop uploads both tracks to `/api/capture`.

## Known limitations

- **Chrome only**, browser tab only — desktop apps (Zoom/Preply desktop) are out of scope.
  If those become important, the pipeline is source-agnostic and a meeting-bot source
  (e.g. Recall.ai) could feed the same `/api/capture` flow.
- **1-on-1 only** — group calls would need real diarization.
- If the lesson runs in a separate pop-out window, record the tab that actually plays the
  audio.
