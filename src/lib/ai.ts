// Claude-backed generation of structured lesson feedback.
//
// Server-only. Given a labelled lesson transcript plus a little context about the
// student, Claude produces the exact feedback shape the review screen already
// renders (vocab with examples, what went well, focus areas, homework, next-lesson
// plan, observed CEFR level, talk-time split, private tutor notes). This is the
// same output an STT step would eventually feed — the transcript is just supplied
// by paste for now, so the signature won't change when speech-to-text lands.

import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";
import { CEFR_LEVELS, type CEFRLevel, type TalkTime, type VocabItem } from "./mock";

// Kept as a single swappable constant. Sonnet 5 is used here for speed (roughly
// halves the analysis step vs Opus 4.8, ~5x cheaper) while keeping high quality
// on this structured-feedback task. Switch to "claude-opus-4-8" for maximum
// quality, or "claude-haiku-4-5" for the fastest/cheapest at a larger quality
// tradeoff. All support adaptive thinking + effort + json_schema output.
const MODEL = "claude-sonnet-5";

// Lazy client so `next build` doesn't require the key at import time (mirrors the
// lazy `db` client in src/db/index.ts).
let client: Anthropic | undefined;
function getClient(): Anthropic {
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
}

/** Context about the student that sharpens the generated feedback. */
export type LessonContext = {
  studentName: string;
  native: string;
  level: string; // e.g. "B1 → B2"
  goal: string;
  focus: string[]; // known weaknesses / areas being worked on
  interests?: string[];
};

/** The structured feedback Claude returns for one lesson. */
export type GeneratedFeedback = {
  topic: string; // short lesson topic, e.g. "Negotiating deadlines"
  observedLevel: CEFRLevel;
  talkTime: TalkTime;
  vocab: VocabItem[];
  wentWell: string[];
  focus: string[];
  homework: string;
  additionalInfo: string;
  nextLesson: string[];
  lessonEndedAt: string;
  tutorNotes: string;
};

// JSON schema for structured outputs. Every object needs additionalProperties:false
// and a full `required` list; string/number length + range constraints aren't
// supported, so guidance about counts lives in the prompt instead.
const FEEDBACK_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    topic: { type: "string" },
    observedLevel: { type: "string", enum: CEFR_LEVELS },
    talkTime: {
      type: "object",
      additionalProperties: false,
      properties: {
        tutor: { type: "integer" },
        student: { type: "integer" },
      },
      required: ["tutor", "student"],
    },
    vocab: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          term: { type: "string" },
          meaning: { type: "string" },
          example: { type: "string" },
        },
        required: ["term", "meaning", "example"],
      },
    },
    wentWell: { type: "array", items: { type: "string" } },
    focus: { type: "array", items: { type: "string" } },
    homework: { type: "string" },
    additionalInfo: { type: "string" },
    nextLesson: { type: "array", items: { type: "string" } },
    lessonEndedAt: { type: "string" },
    tutorNotes: { type: "string" },
  },
  required: [
    "topic",
    "observedLevel",
    "talkTime",
    "vocab",
    "wentWell",
    "focus",
    "homework",
    "additionalInfo",
    "nextLesson",
    "lessonEndedAt",
    "tutorNotes",
  ],
} as const;

const SYSTEM_PROMPT = `You are an expert English-language tutor writing structured post-lesson feedback from a transcript of a one-to-one lesson. The transcript labels turns as "Tutor:" and "Student:".

Produce feedback that is warm, specific, and grounded ONLY in what the transcript shows — never invent achievements or vocabulary that didn't come up. Write in the second person where the field is shown to the student (additionalInfo, homework), and as private notes to the tutor for tutorNotes.

Field guidance:
- topic: a short 2–5 word lesson topic drawn from the main theme (e.g. "Negotiating deadlines").
- observedLevel: the CEFR level (A1–C2) the student actually demonstrated this lesson, based on their output — not their target.
- talkTime: your best estimate of the share of speaking time, as two integers (tutor + student) that sum to 100. In a healthy lesson the student speaks at least half.
- vocab: words or phrases that genuinely came up and are worth reviewing — scale the count to the lesson. A short or slow lesson may only yield 3–5, while a full ~50-minute lesson rich in language typically supports 8–12. Never pad the list with terms that didn't genuinely come up just to reach a number. For each: the term, a short plain-English meaning, and one natural example sentence (prefer the student's own context/interests when it fits).
- wentWell: 2–3 concrete strengths shown in the transcript.
- focus: 2–3 specific areas to improve, phrased constructively; include the correction where useful (e.g. 'Articles before abstract nouns ("the advice" → "advice")').
- homework: one short, concrete task that practises this lesson's language.
- additionalInfo: a brief encouraging note to the student.
- nextLesson: 2–3 planned activities that build on where this lesson ended.
- lessonEndedAt: one sentence on what was covered and where the lesson stopped.
- tutorNotes: private notes for the tutor — the student's trajectory and the single most useful thing to work on next.`;

/**
 * Generate structured lesson feedback from a transcript. Throws if the key is
 * missing, the model refuses, or the response can't be parsed.
 */
export async function generateLessonFeedback(
  transcript: string,
  context: LessonContext,
): Promise<GeneratedFeedback> {
  const userContent = [
    "Write the post-lesson feedback for this lesson.",
    "",
    "Student context:",
    `- Name: ${context.studentName}`,
    `- Native language: ${context.native}`,
    `- Level (current → target): ${context.level}`,
    `- Goal: ${context.goal}`,
    context.focus.length ? `- Currently working on: ${context.focus.join(", ")}` : "",
    context.interests?.length ? `- Interests: ${context.interests.join(", ")}` : "",
    "",
    "Lesson transcript:",
    transcript.trim(),
  ]
    .filter(Boolean)
    .join("\n");

  // Stream rather than a single blocking request. A long lesson (e.g. a 49-min
  // transcript) is a large input with meaningful output + thinking, and a
  // non-streaming call holds one HTTP request open for the whole generation —
  // long enough that the socket gets dropped ("fetch failed") before it returns,
  // especially inside the Netlify background worker. Streaming keeps the
  // connection alive with incremental events; finalMessage() assembles the
  // complete response. Structured outputs + adaptive thinking both work here.
  const stream = getClient().messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: { type: "json_schema", schema: FEEDBACK_SCHEMA },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userContent }],
  });
  const response = await stream.finalMessage();

  if (response.stop_reason === "refusal") {
    throw new Error("The model declined to generate feedback for this transcript.");
  }

  // With output_config.format the text block is JSON validated against the schema.
  const parsed = parseTextOutput(response) as GeneratedFeedback | null;

  if (!parsed) {
    throw new Error(
      response.stop_reason === "max_tokens"
        ? "The feedback was cut off before it finished. Try a shorter transcript."
        : "Couldn't read the generated feedback.",
    );
  }
  return parsed;
}

function parseTextOutput(response: Anthropic.Message): unknown {
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  if (!text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
