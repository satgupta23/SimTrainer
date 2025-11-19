// app/api/evaluate/route.ts
import { NextResponse } from 'next/server';
import type { ScenarioId } from '@/data/tracks';

const OLLAMA_URL =
  process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';
const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL ?? 'llama3';

const EVAL_SYSTEM_PROMPT = `You are an expert RA/TA communication coach. Score the RA/TA's performance across the ENTIRE conversation transcript, not just their most recent reply. Output ONLY valid JSON with this exact shape:
{
  "empathy": <integer 1-5>,
  "curiosity": <integer 1-5>,
  "structure": <integer 1-5>,
  "satisfaction": <integer 1-10>,
  "resolved": <boolean>,
  "summary": "<2-4 sentences that reference specific moments or patterns from the entire conversation. Include at least one strength and one coaching suggestion.>"
}
- Empathy reflects how well the RA/TA validates feelings and shows understanding.
- Curiosity reflects how they ask questions that invite more sharing.
- Structure reflects how organized the response is (summaries, next steps, clear focus).
- Satisfaction reflects how consoled and settled the student appears by the end; higher scores require signs of closure in both people's turns.
- resolved must be true ONLY when the student seems satisfied and next steps are clear enough that the conversation can end.`;

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Feedback = {
  empathy: number;
  curiosity: number;
  structure: number;
  satisfaction: number;
  resolved: boolean;
  summary: string;
};

type OllamaMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

function clampScore(x: number) {
  return Math.max(1, Math.min(5, Math.round(x)));
}

function clampScore10(x: number) {
  return Math.max(1, Math.min(10, Math.round(x)));
}

function formatConversation(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === 'user' ? 'RA/TA' : 'Student'}: ${m.content}`)
    .join('\n\n');
}

function buildEvaluationPrompt(messages: ChatMessage[]): string {
  const turns = messages.filter((m) => m.role === 'user').length;
  const transcript = formatConversation(messages);
  return `Evaluate the RA/TA's empathy, curiosity, and structure using the rubric. There have been ${turns} RA/TA replies. Consider the ENTIRE conversation when scoring - do not focus on only the final message.

Transcript:
${transcript}`;
}

function extractFeedbackFromReply(reply: string): Feedback | null {
  const jsonMatch = reply.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('No JSON object in evaluation reply:', reply);
    return null;
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    const empathy = Number(parsed.empathy ?? parsed.empathyScore);
    const curiosity = Number(parsed.curiosity ?? parsed.curiosityScore);
    const structure = Number(parsed.structure ?? parsed.structureScore);
    const satisfactionValue = Number(
      parsed.satisfaction ??
        parsed.studentSatisfaction ??
        parsed.satisfactionScore,
    );
    const summary =
      typeof parsed.summary === 'string' ? parsed.summary.trim() : '';
    const resolvedField =
      parsed.resolved ?? parsed.completed ?? parsed.done ?? parsed.closure;

    if (
      Number.isNaN(empathy) ||
      Number.isNaN(curiosity) ||
      Number.isNaN(structure) ||
      !summary
    ) {
      return null;
    }

    const empathyScore = clampScore(empathy);
    const curiosityScore = clampScore(curiosity);
    const structureScore = clampScore(structure);
    const fallbackSatisfaction =
      ((empathyScore + curiosityScore + structureScore) / 3) * 2;

    const satisfaction = clampScore10(
      Number.isNaN(satisfactionValue) ? fallbackSatisfaction : satisfactionValue,
    );

    let resolved =
      typeof resolvedField === 'boolean'
        ? resolvedField
        : typeof resolvedField === 'string'
        ? resolvedField.trim().toLowerCase() === 'true'
        : false;

    if (!resolved) {
      resolved =
        empathyScore >= 5 &&
        curiosityScore >= 5 &&
        structureScore >= 5 &&
        satisfaction >= 9;
    }

    return {
      empathy: empathyScore,
      curiosity: curiosityScore,
      structure: structureScore,
      satisfaction,
      resolved,
      summary,
    };
  } catch (err) {
    console.error('Failed to parse evaluation JSON:', err, reply);
    return null;
  }
}

async function requestModelFeedback(
  messages: ChatMessage[],
): Promise<Feedback | null> {
  if (!messages.some((m) => m.role === 'user')) {
    return null;
  }

  const prompt = buildEvaluationPrompt(messages);
  const chatMessages: OllamaMessage[] = [
    { role: 'system', content: EVAL_SYSTEM_PROMPT },
    { role: 'user', content: prompt },
  ];

  try {
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: chatMessages,
      }),
    });

    const raw = await res.text();
    if (!res.ok) {
      console.error('Feedback model error:', res.status, raw);
      return null;
    }

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      console.error('Failed to parse feedback model JSON:', err, raw);
      return null;
    }

    const reply: string =
      data?.message?.content ??
      data?.choices?.[0]?.message?.content ??
      '';

    if (!reply) {
      console.error('Empty reply from feedback model:', data);
      return null;
    }

    return extractFeedbackFromReply(reply);
  } catch (err) {
    console.error('Feedback request failed:', err);
    return null;
  }
}

function computeHeuristicFeedback(messages: ChatMessage[]): Feedback {
  const userText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ');

  const lower = userText.toLowerCase();

  const empathyKeywords = [
    'that sounds',
    "i'm sorry",
    'i am sorry',
    'i can see',
    'i understand',
    'makes sense',
    'that must be',
    'thanks for sharing',
    'thank you for sharing',
  ];

  const closureKeywords = [
    'glad we could',
    'does that help',
    'does this help',
    'let me know if anything else comes up',
    'reach out',
    'keep me posted',
    'touch base',
    'next time we meet',
    'check back',
  ];

  let empathyHits = 0;
  for (const k of empathyKeywords) {
    if (lower.includes(k)) empathyHits++;
  }
  const empathy = clampScore(2 + empathyHits * 0.7);

  const questionCount = (userText.match(/\?/g) ?? []).length;
  const curiosity = clampScore(1 + questionCount);

  const sentences = userText
    .split(/[.!?]/)
    .map((s) => s.trim())
    .filter(Boolean).length;
  const structure = clampScore(1 + sentences * 0.6);

  let closureSignals = 0;
  for (const k of closureKeywords) {
    if (lower.includes(k)) closureSignals++;
  }

  const raTurns = messages.filter((m) => m.role === 'user').length;
  const avgQuality = (empathy + curiosity + structure) / 3;
  const depthBonus = Math.min(4, Math.max(0, raTurns - 1) * 1.2);
  const closureBonus = Math.min(3, closureSignals * 1.5);
  const satisfaction = clampScore10(avgQuality * 1.4 + depthBonus + closureBonus);

  const resolved =
    empathy >= 5 && curiosity >= 5 && structure >= 5 && satisfaction >= 9;

  let summary = 'Here is some quick feedback on your response.\n\n';

  summary +=
    empathy >= 4
      ? '- You do a good job acknowledging feelings and showing empathy. '
      : '- Try to explicitly name and validate the other person\'s feelings (e.g., "That sounds really overwhelming."). ';

  summary +=
    curiosity >= 4
      ? '- You ask several questions that invite the other person to share more. '
      : '- You could add a few more open-ended questions to better understand their situation. ';

  summary +=
    structure >= 4
      ? '- Your responses are fairly organized and move toward a next step.'
      : '- Consider briefly summarizing what you heard and suggesting one concrete next step so the conversation feels more structured.';

  summary +=
    satisfaction >= 8
      ? '- The student likely feels more settled with your support; invite them to confirm they are OK wrapping up. '
      : '- Before ending the chat, check that the student feels calmer and knows the next step. ';

  summary += resolved
    ? 'They seem satisfied, so you can celebrate closing the scenario.'
    : 'Keep the door open for more sharing until they signal the issue is resolved.';

  return { empathy, curiosity, structure, satisfaction, resolved, summary };
}

export async function POST(req: Request) {
  const { scenarioId, messages } = (await req.json()) as {
    scenarioId: ScenarioId;
    messages: ChatMessage[];
  };

  void scenarioId;

  const llmFeedback = await requestModelFeedback(messages);
  const feedback = llmFeedback ?? computeHeuristicFeedback(messages);
  return NextResponse.json({ feedback });
}
