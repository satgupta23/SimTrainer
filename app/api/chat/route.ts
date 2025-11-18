// app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { getScenario, type ScenarioId, type TrackId } from '@/data/tracks';

const OLLAMA_URL =
  process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';
const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ?? 'llama3';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type CustomScenarioPayload = {
  trackId: TrackId;
  title: string;
  shortDescription: string;
  personaNotes?: string;
};

type PromptConfig = {
  scenarioId?: string;
  trackId?: TrackId;
  title?: string;
  shortDescription?: string;
  personaNotes?: string;
};

type OllamaMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function buildSystemPrompt({
  scenarioId,
  trackId,
  title,
  shortDescription,
  personaNotes,
}: PromptConfig): string {
  const roleDescription =
    trackId === 'ta'
      ? 'a university student meeting with your teaching assistant (TA)'
      : 'a resident student talking with your resident assistant (RA)';

  const detailLines: string[] = [];

  if (title) {
    detailLines.push(`Scenario: ${title}`);
  } else if (scenarioId) {
    detailLines.push(`Scenario id: ${scenarioId}`);
  }

  if (shortDescription) {
    detailLines.push(`Summary: ${shortDescription}`);
  }

  const cleanNotes = personaNotes?.trim();
  if (cleanNotes) {
    detailLines.push(`Persona notes: ${cleanNotes}`);
  }

  const details =
    detailLines.length > 0 ? `${detailLines.join('\n')}\n\n` : '';

  return `You are role-playing as ${roleDescription} in a live training simulation. The human participant is the RA/TA who is trying to support you. Reply ONLY as the student/resident who needs help.\n\n${details}Guidelines:\n- Stay in character at all times and speak in the first person.\n- Keep responses short (1-4 sentences) and natural.\n- Share emotions, worries, and context gradually, based on what you would realistically know.\n- Ask for clarification when you need it, but do NOT offer advice, coaching, or solutions to the RA/TA.\n- Avoid mentioning self-harm, diagnoses, or treatment plans.`;
}

export async function POST(req: Request) {
  try {
    const { scenarioId, messages, customScenario } = (await req.json()) as {
      scenarioId: string;
      messages: ChatMessage[];
      customScenario?: CustomScenarioPayload;
    };

    let promptDetails: PromptConfig | null = null;

    if (customScenario) {
      promptDetails = {
        trackId: customScenario.trackId,
        title: customScenario.title,
        shortDescription: customScenario.shortDescription,
        personaNotes: customScenario.personaNotes,
      };
    } else if (scenarioId) {
      const builtIn = getScenario(scenarioId as ScenarioId);
      if (builtIn) {
        promptDetails = {
          trackId: builtIn.trackId,
          title: builtIn.title,
          shortDescription: builtIn.shortDescription,
        };
      }
    }

    const systemPrompt = buildSystemPrompt({
      scenarioId,
      ...((promptDetails ?? {}) as PromptConfig),
    });

    // Build request body for Ollama chat
    const chatMessages: OllamaMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const body = {
      model: OLLAMA_MODEL,
      stream: false, // IMPORTANT: force non-streaming JSON response
      messages: chatMessages,
    };

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Read raw text first so we can log or parse manually
    const raw = await ollamaRes.text();

    if (!ollamaRes.ok) {
      console.error('Ollama error:', ollamaRes.status, raw);
      return NextResponse.json(
        {
          error: 'Ollama request failed',
          status: ollamaRes.status,
          details: raw,
        },
        { status: 500 },
      );
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse Ollama JSON:', err, raw);
      return NextResponse.json(
        { error: 'Bad response from Ollama' },
        { status: 500 },
      );
    }

    // Different Ollama versions use slightly different shapes
    const reply: string =
      data?.message?.content ??
      data?.choices?.[0]?.message?.content ??
      '';

    if (!reply) {
      console.error('No reply content in Ollama response:', data);
      return NextResponse.json(
        { error: 'Empty reply from Ollama' },
        { status: 500 },
      );
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Chat route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
