import { NextResponse } from 'next/server';
import { getScenario } from '@/data/tracks';

interface IncomingMessage {
  role: 'user' | 'ai';
  content: string;
}

interface CustomScenarioMeta {
  trackId: 'ra' | 'ta';
  title: string;
  shortDescription: string;
  personaNotes?: string;
}

const OLLAMA_URL =
  process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3';

// ---------- Offline fallback replies (no AI) ----------

function offlineReply(
  scenarioId: string,
  userText: string,
  scenarioTitle?: string
): string {
  const snippet = userText ? `"${userText.slice(0, 120)}"` : '';

  if (scenarioId === 'ra-noise-complaint') {
    return (
      "I'm just really tired and frustrated. The noise keeps coming back, even after quiet hours, and I have work/classes tomorrow. " +
      (snippet
        ? `When you say ${snippet}, I'm trying to believe you'll actually do something, but I'm still worried it'll keep happening.`
        : '')
    );
  }

  if (scenarioId === 'ra-homesick') {
    return (
      "I just feel like I don't belong here yet. Everyone already has friend groups and I miss home a lot. " +
      (snippet
        ? `Hearing ${snippet} helps a bit, but it's still hard to imagine this place feeling like home.`
        : '')
    );
  }

  if (scenarioId === 'ta-failed-midterm') {
    return (
      "I studied a ton and still did badly on that midterm. It makes me wonder if I'm actually cut out for this class. " +
      (snippet
        ? `After you said ${snippet}, I'm trying to see a path forward, but I'm still pretty discouraged.`
        : '')
    );
  }

  if (scenarioId === 'ta-extension-request') {
    return (
      "I know the deadline was clear, but a bunch of stuff hit me at once this week and I fell behind. " +
      (snippet
        ? `Your response ${snippet} makes me curious if you'll actually be flexible or if I'm just out of luck.`
        : '')
    );
  }

  return (
    (scenarioTitle
      ? `In this situation (${scenarioTitle}), `
      : 'In this situation, ') +
    "I'm trying to be honest about how I'm feeling. Thanks for taking the time to talk with me."
  );
}

// ---------- Main handler: try Ollama, else fallback ----------

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const scenarioId: string | undefined = body?.scenarioId;
  const messages: IncomingMessage[] = body?.messages ?? [];
  const customScenario: CustomScenarioMeta | undefined =
    body?.customScenario;

  if (!scenarioId) {
    return NextResponse.json(
      { error: 'Missing scenarioId' },
      { status: 400 }
    );
  }

  const builtInScenario = customScenario
    ? null
    : getScenario(scenarioId as any);

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const userText = lastUser?.content ?? '';

  // Build system prompt
  let systemPrompt: string;

  if (customScenario) {
    systemPrompt = `You are role-playing as a ${
      customScenario.trackId === 'ra'
        ? 'college resident'
        : 'student in a university course'
    } in the following scenario:

Title: ${customScenario.title}
Description: ${customScenario.shortDescription}
Additional notes from the training designer:
${customScenario.personaNotes || '(No extra notes provided.)'}

Goals:
- Stay in character as the student/resident at all times.
- Express real emotions (stress, frustration, worry, relief, etc.) but stay realistic and appropriate for a campus setting.
- Keep replies short: 1–4 sentences.
- Do NOT coach the other person; you are the one being helped.
- Avoid giving clinical mental health advice or talking about self-harm.`;
  } else if (builtInScenario) {
    systemPrompt = `You are role-playing as a ${
      builtInScenario.trackId === 'ra'
        ? 'college resident'
        : 'student in a university course'
    } in the following scenario:

Title: ${builtInScenario.title}
Description: ${builtInScenario.shortDescription}

Goals:
- Stay in character as the student/resident at all times.
- Express real emotions (stress, frustration, worry, etc.) but stay realistic and appropriate for a campus setting.
- Keep replies short: 1–4 sentences.
- Do NOT coach the other person; you are the one being helped.`;
  } else {
    systemPrompt =
      'You are role-playing as a student or resident talking to a helper. Stay in character, express realistic emotions, and keep responses 1–4 sentences.';
  }

  const llmMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  ];

  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: llmMessages,
        stream: false,
      }),
    });

    if (!res.ok) {
      console.error('Ollama HTTP error:', res.status, res.statusText);
      const fallback = offlineReply(
        scenarioId,
        userText,
        builtInScenario?.title || customScenario?.title
      );
      return NextResponse.json({ reply: fallback });
    }

    const data = await res.json();
    const reply =
      data?.message?.content?.trim() ||
      offlineReply(
        scenarioId,
        userText,
        builtInScenario?.title || customScenario?.title
      );

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Error calling Ollama:', err);
    const fallback = offlineReply(
      scenarioId,
      userText,
      builtInScenario?.title || customScenario?.title
    );
    return NextResponse.json({ reply: fallback });
  }
}
