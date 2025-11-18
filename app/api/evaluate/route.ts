// app/api/evaluate/route.ts
import { NextResponse } from 'next/server';
import type { ScenarioId } from '@/data/tracks';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Feedback = {
  empathy: number;
  curiosity: number;
  structure: number;
  summary: string;
};

function clampScore(x: number) {
  return Math.max(1, Math.min(5, Math.round(x)));
}

function computeFeedback(messages: ChatMessage[]): Feedback {
  const userText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');

  const lower = userText.toLowerCase();

  const empathyKeywords = [
    'that sounds',
    'i\'m sorry',
    'i am sorry',
    'i can see',
    'i understand',
    'makes sense',
    'that must be',
    'thanks for sharing',
    'thank you for sharing',
  ];

  let empathyHits = 0;
  for (const k of empathyKeywords) {
    if (lower.includes(k)) empathyHits++;
  }
  const empathy = clampScore(2 + empathyHits * 0.7); // 0–5 hits → ~2–5

  const questionCount = (userText.match(/\?/g) ?? []).length;
  const curiosity = clampScore(1 + questionCount); // more questions → higher curiosity

  const sentences = userText
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  const structure = clampScore(1 + sentences * 0.6); // more than one clear sentence → higher

  let summary = 'Here is some quick feedback on your response.\n\n';

  summary +=
    empathy >= 4
      ? '• You do a good job acknowledging feelings and showing empathy. '
      : '• Try to explicitly name and validate the other person’s feelings (e.g., “That sounds really overwhelming.”). ';

  summary +=
    curiosity >= 4
      ? '• You ask several questions that invite the other person to share more. '
      : '• You could add a few more open-ended questions to better understand their situation. ';

  summary +=
    structure >= 4
      ? '• Your responses are fairly organized and move toward a next step.'
      : '• Consider briefly summarizing what you heard and suggesting one concrete next step so the conversation feels more structured.';

  return { empathy, curiosity, structure, summary };
}

export async function POST(req: Request) {
  const { scenarioId, messages } = (await req.json()) as {
    scenarioId: ScenarioId;
    messages: ChatMessage[];
  };

  // scenarioId is unused for now, but we keep it for future per-scenario rules
  void scenarioId;

  const feedback = computeFeedback(messages);
  return NextResponse.json({ feedback });
}
