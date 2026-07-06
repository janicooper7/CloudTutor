// Sends the lesson-report email (with the PDF attached) via Resend. Server-only.

import { Resend } from "resend";
import { env } from "./env";
import type { Session } from "./mock";

let client: Resend | undefined;
function getClient(): Resend {
  if (!client) client = new Resend(env.RESEND_API_KEY);
  return client;
}

function lessonTopic(title: string): string {
  return title.includes("·") ? title.split("·").slice(1).join("·").trim() : title;
}

export async function sendLessonReportEmail(args: {
  to: string;
  studentName: string;
  tutorName: string;
  session: Session;
  pdf: Uint8Array;
}): Promise<void> {
  const { to, studentName, tutorName, session, pdf } = args;
  const firstName = studentName.split(" ")[0];
  const topic = lessonTopic(session.title);

  const homeworkBlock = session.homework.trim()
    ? `<p style="margin:16px 0 6px;font-weight:600;color:#123a6b;">Homework</p>
       <p style="margin:0;color:#3f4750;">${escapeHtml(session.homework)}</p>`
    : "";

  const html = `
  <div style="background:#eef4fd;padding:28px 0;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f4;">
      <div style="background:#1f6ee0;padding:24px 28px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.08em;color:#cfe0fb;">CLOUDTUTOR</div>
        <div style="font-size:20px;font-weight:700;color:#ffffff;margin-top:6px;">${escapeHtml(topic)}</div>
        <div style="font-size:13px;color:#dbe9fd;margin-top:4px;">${escapeHtml(session.date)} · ${session.durationMin} min</div>
      </div>
      <div style="padding:26px 28px;color:#1f2430;">
        <p style="margin:0 0 12px;">Hi ${escapeHtml(firstName)},</p>
        <p style="margin:0 0 12px;color:#3f4750;">
          Here are your notes from today's lesson. Your full report — new vocabulary,
          what went well, and areas to work on — is attached as a PDF.
        </p>
        ${homeworkBlock}
        <p style="margin:20px 0 0;color:#3f4750;">See you next time,<br/>${escapeHtml(tutorName)}</p>
      </div>
      <div style="padding:14px 28px;border-top:1px solid #eef1f6;font-size:12px;color:#8b909a;">
        Sent with CloudTutor
      </div>
    </div>
  </div>`;

  const { error } = await getClient().emails.send({
    from: env.EMAIL_FROM,
    to,
    subject: `Your lesson notes — ${topic}`,
    html,
    attachments: [
      { filename: `CloudTutor lesson — ${topic}.pdf`, content: Buffer.from(pdf) },
    ],
  });

  if (error) {
    throw new Error(`Couldn't send the email: ${error.message ?? "unknown error"}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
