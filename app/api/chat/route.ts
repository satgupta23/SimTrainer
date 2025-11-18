// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import type { ScenarioId } from '@/data/tracks';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const baseByScenario: Record<ScenarioId, string> = {
  'ra-noise-complaint':
    'Thanks for taking this seriously. The noise has really been getting to me. ',
  'ra-homesick':
    'I appreciate you listening. Being away from home has been harder than I thought. ',
  'ta-failed-midterm':
    'I put so much time into studying and still did badly, which is really discouraging. ',
  'ta-extension-request':
    'I know I should have started earlier, but things really piled up this week. ',
};

function buildReply(scenarioId: ScenarioId, lastUserMessage: string | null) {
  const base = baseByScenario[scenarioId] ?? 'Thanks for hearing me out. ';

  if (!lastUserMessage) {
    return base + "Could you tell me a bit more about how you see the situation?";
  }

  const snippet =
    lastUserMessage.length > 80
      ? `${lastUserMessage.slice(0, 80)}…`
      : lastUserMessage;

  return (
    base +
    `When you said "${snippet}", that really captures how I'm feeling. ` +
    'What do you think might help next?'
  );
}

export async function POST(req: Request) {
  const { scenarioId, messages } = (await req.json()) as {
    scenarioId: ScenarioId;
    messages: ChatMessage[];
  };

  const lastUserMessage =
    [...messages].reverse().find((m) => m.role === 'user')?.content ?? null;

  const reply = buildReply(scenarioId, lastUserMessage);

  return NextResponse.json({ reply });
}
