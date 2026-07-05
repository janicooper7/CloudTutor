# CloudTutor

A web app + companion browser extension for 1-on-1 online language tutors. It captures a
lesson's audio (student = tab audio, tutor = mic), transcribes it, and uses Claude to generate
editable feedback — a student report (emailed as a PDF) and private teaching notes — plus a
per-student learning journey that improves suggestions over time.

## Stack

- **Next.js 16** (App Router) + React 19, Tailwind v4
- **Neon** Postgres + **Drizzle ORM**
- **NextAuth v5** (Google sign-in)
- **Claude** (`@anthropic-ai/sdk`) for feedback, **Deepgram** for speech-to-text
- **Resend** + `pdf-lib` for the emailed lesson PDF
- **Netlify** hosting — lesson audio is chunk-uploaded to Netlify Blobs and processed by a
  background function (see below)

## Local development

```bash
npm install
cp .env.example .env.local   # fill in the values (see the file's comments)
npm run dev
```

To exercise the full record → draft pipeline locally you need **Netlify Blobs**, which only
exists under the Netlify CLI:

```bash
npx netlify dev
```

Database migrations (Drizzle): `npm run db:generate` / `db:migrate` / `db:push` / `db:studio`.

## Deploying to Netlify

Because a full lesson's audio far exceeds Netlify's 6 MB request limit and 26–60 s function
timeout, the two audio tracks are sliced into ~4 MB chunks, uploaded to Netlify Blobs via
`/api/upload/*`, and transcribed + drafted by the 15-minute background function in
`netlify/functions/process.mts`, which then deletes the audio.

Connect the repo in Netlify and set the environment variables listed in the **Deploying to
Netlify** section of [`.env.example`](./.env.example) (all the app keys plus `INTERNAL_TASK_SECRET`
and `AUTH_TRUST_HOST=true`), then add `https://<your-site>.netlify.app/api/auth/callback/google`
to your Google OAuth client's authorized redirect URIs.

## Browser extension

The `extension/` folder is an unpacked Chrome (Manifest V3) extension. Load it via
`chrome://extensions` → Developer mode → Load unpacked, then set its app URL and capture token
from the dashboard's **Settings → Lesson capture**.
