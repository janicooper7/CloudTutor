// Speech-to-text: turn a lesson's two audio tracks into a labelled transcript.
//
// The capture extension records the two speakers as physically separate files —
// tab audio (the student) and the tutor's microphone — so we get clean speaker
// separation without any AI diarization. We transcribe each track on its own,
// then interleave the words by timestamp to reconstruct the conversation as a
// "Tutor:" / "Student:" dialogue, which feeds straight into the AI pipeline.

import { DeepgramClient } from "@deepgram/sdk";
import { env } from "./env";

// nova-3 is Deepgram's latest general model. Kept as a constant for easy tuning.
const MODEL = "nova-3";

let client: DeepgramClient | undefined;
function getClient(): DeepgramClient {
  if (!client) client = new DeepgramClient({ apiKey: env.DEEPGRAM_API_KEY });
  return client;
}

type Speaker = "Tutor" | "Student";
type Word = { start: number; text: string; speaker: Speaker };

// The subset of Deepgram's word shape we rely on (results.channels[].alternatives[].words[]).
type DgWord = { start: number; word: string; punctuated_word?: string };

async function transcribeTrack(audio: Buffer, speaker: Speaker): Promise<Word[]> {
  const res = await getClient().listen.v1.media.transcribeFile(audio, {
    model: MODEL,
    language: "en",
    smart_format: true,
    punctuate: true,
  });

  // Callback-mode responses have no `results`; we transcribe synchronously.
  const results = "results" in res ? res.results : undefined;
  const words = (results?.channels?.[0]?.alternatives?.[0]?.words ?? []) as DgWord[];
  return words.map((w) => ({
    start: w.start,
    text: w.punctuated_word ?? w.word,
    speaker,
  }));
}

/**
 * Transcribe both lesson tracks and merge them into a single labelled transcript.
 * Words are ordered by their start time, and consecutive words from the same
 * speaker are grouped into one turn.
 */
export async function transcribeLesson(input: {
  studentAudio: Buffer;
  tutorAudio: Buffer;
}): Promise<string> {
  let student: Word[];
  let tutor: Word[];
  try {
    [student, tutor] = await Promise.all([
      transcribeTrack(input.studentAudio, "Student"),
      transcribeTrack(input.tutorAudio, "Tutor"),
    ]);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "unknown error";
    throw new Error(`Couldn't transcribe the audio: ${detail}`);
  }

  const words = [...student, ...tutor].sort((a, b) => a.start - b.start);
  if (words.length === 0) {
    throw new Error("No speech was detected in the recordings.");
  }

  const turns: { speaker: Speaker; text: string }[] = [];
  for (const w of words) {
    const last = turns[turns.length - 1];
    if (last && last.speaker === w.speaker) last.text += ` ${w.text}`;
    else turns.push({ speaker: w.speaker, text: w.text });
  }

  return turns.map((t) => `${t.speaker}: ${t.text.trim()}`).join("\n");
}
