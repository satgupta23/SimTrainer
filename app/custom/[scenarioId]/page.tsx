'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type TrackId = 'ra' | 'ta';

type CustomScenario = {
  id: string;
  trackId: TrackId;
  title: string;
  shortDescription: string;
  personaNotes: string;
  createdAt: string;
};

type ChatMessage = {
  role: 'user' | 'ai';
  content: string;
};

type Scores = {
  empathy: number;    // 1–5
  curiosity: number;  // 1–5
  structure: number;  // 1–5
};

type HistoryEntry = {
  id: string; // unique session id
  scenarioId: string;
  scenarioTitle: string;
  trackId: TrackId;
  isCustom: boolean;
  endedAt: string;
  messages: ChatMessage[];
  scores: Scores;
};

const STORAGE_KEY_SCENARIOS = 'simtrainer.customScenarios.v1';
const STORAGE_KEY_HISTORY = 'simtrainer.history.v1';

// ----------------- scoring helpers -----------------

function clampScore(raw: number, max: number): number {
  if (raw <= 0) return 1;
  if (raw >= max) return 5;
  // simple linear scale: 0..max → 1..5
  const frac = Math.min(raw, max) / max;
  return Math.round(1 + frac * 4);
}

function scoreConversation(messages: ChatMessage[]): {
  scores: Scores;
  notes: string[];
} {
  const userTexts = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content.toLowerCase());

  // empathy: reflections / validation phrases
  const empathyPhrases = [
    'that sounds',
    'i hear',
    'i can see',
    'it makes sense',
    'must be hard',
    'i get why',
    'i understand that',
    'thanks for sharing',
  ];

  // curiosity: open questions, “what / how / tell me…”
  const curiosityOpeners = [
    'what ',
    'how ',
    'tell me',
    'could you share',
    'can you tell me',
    'walk me through',
  ];

  // structure: signposting / summarizing / next steps
  const structurePhrases = [
    "here's what",
    "let's",
    'next step',
    'we can',
    'first',
    'second',
    'third',
    'to summarize',
    'sounds like',
  ];

  let empathyHits = 0;
  let curiosityHits = 0;
  let structureHits = 0;
  let openQuestionCount = 0;

  for (const text of userTexts) {
    for (const p of empathyPhrases) {
      if (text.includes(p)) empathyHits++;
    }
    for (const p of curiosityOpeners) {
      if (text.includes(p) && text.includes('?')) {
        curiosityHits++;
      }
    }
    if (text.includes('?')) {
      openQuestionCount++;
    }
    for (const p of structurePhrases) {
      if (text.includes(p)) structureHits++;
    }
  }

  const empathyScore = clampScore(empathyHits, 5);
  const curiosityScore = clampScore(curiosityHits + openQuestionCount / 2, 6);
  const structureScore = clampScore(structureHits, 4);

  const notes: string[] = [];

  if (empathyScore <= 2) {
    notes.push(
      'Try using more empathic reflections like “That sounds really stressful” or “I can see why that would be hard.”'
    );
  } else if (empathyScore === 3) {
    notes.push(
      'You used some validation! See if you can reflect feelings a bit more directly (e.g., “It sounds like you’re overwhelmed.”).'
    );
  } else {
    notes.push(
      'Nice job validating their feelings without immediately jumping to solutions.'
    );
  }

  if (curiosityScore <= 2) {
    notes.push(
      'Ask more open-ended questions (starting with what/how) to understand their story before offering ideas.'
    );
  } else if (curiosityScore === 3) {
    notes.push(
      'You asked a few questions; try following up with “tell me more” style prompts to deepen the conversation.'
    );
  } else {
    notes.push(
      'Good use of open questions to explore what’s going on for them.'
    );
  }

  if (structureScore <= 2) {
    notes.push(
      'Consider summarizing what you heard and proposing a small next step (e.g., “So far I’m hearing…, maybe first we can…”).'
    );
  } else if (structureScore === 3) {
    notes.push(
      'There is some structure; you could make next steps even clearer by briefly summarizing and proposing one concrete plan.'
    );
  } else {
    notes.push(
      'You provided a clear sense of direction and next steps without rushing the student/resident.'
    );
  }

  return {
    scores: {
      empathy: empathyScore,
      curiosity: curiosityScore,
      structure: structureScore,
    },
    notes,
  };
}

function appendHistory(entry: HistoryEntry) {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_HISTORY);
    const existing = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    const updated = [entry, ...existing];
    window.localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save history entry', err);
  }
}

// ----------------- page component -----------------

export default function CustomScenarioPage() {
  const params = useParams<{ scenarioId: string }>();
  const scenarioId = (params?.scenarioId ?? '') as string;

  const [scenario, setScenario] = useState<CustomScenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [scores, setScores] = useState<Scores | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState<string[]>([]);
  const [ended, setEnded] = useState(false);

  // Load the custom scenario definition from localStorage
  useEffect(() => {
    if (typeof window === 'undefined' || !scenarioId) return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_SCENARIOS);
      if (!raw) return;

      const all = JSON.parse(raw) as CustomScenario[];
      const found = all.find((s) => s.id === scenarioId);

      if (found) {
        setScenario(found);
      }
    } catch (err) {
      console.error('Failed to load custom scenario', err);
    }
  }, [scenarioId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !scenario || ended) return;

    const userText = input.trim();

    const userMessage: ChatMessage = {
      role: 'user',
      content: userText,
    };

    const updated: ChatMessage[] = [...messages, userMessage];

    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId,
          messages: updated,
          customScenario: {
            trackId: scenario.trackId,
            title: scenario.title,
            shortDescription: scenario.shortDescription,
            personaNotes: scenario.personaNotes,
          },
        }),
      });

      if (!res.ok) {
        console.error('Chat API error', res.status, res.statusText);

        const fallbackReply: ChatMessage = {
          role: 'ai',
          content:
            "I'm not sure what to say, but I'm still here and this situation is stressing me out.",
        };

        setMessages([...updated, fallbackReply]);
        return;
      }

      const data = await res.json();
      const replyText =
        (data && typeof data.reply === 'string' ? data.reply.trim() : '') ||
        "I'm still thinking through this. Can you say more?";

      const aiMessage: ChatMessage = {
        role: 'ai',
        content: replyText,
      };

      setMessages([...updated, aiMessage]);
    } catch (err) {
      console.error('Chat request failed', err);

      const errorMessage: ChatMessage = {
        role: 'ai',
        content:
          "Something went wrong on my side, but I'm still in this situation in your scenario.",
      };

      setMessages([...updated, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleEndScenario = () => {
    if (!scenario) return;
    if (messages.length === 0) {
      alert('Have a short conversation first before requesting feedback.');
      return;
    }

    const { scores, notes } = scoreConversation(messages);
    setScores(scores);
    setFeedbackNotes(notes);
    setEnded(true);

    const entry: HistoryEntry = {
      id: `${scenario.id}-${Date.now()}`,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      trackId: scenario.trackId,
      isCustom: true,
      endedAt: new Date().toISOString(),
      messages,
      scores,
    };

    appendHistory(entry);
  };

  // If we don't have a scenario yet (or it wasn't found)
  if (!scenario) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
          <Link href="/" className="text-sm text-sky-400 hover:underline">
            ← Back home
          </Link>
          <h1 className="text-xl font-semibold">Custom scenario not found</h1>
          <p className="text-sm text-slate-300">
            This scenario isn&apos;t in this browser&apos;s saved list. It may
            have been created on another device or cleared from storage.
          </p>
          <Link
            href="/builder"
            className="inline-flex mt-4 text-sm text-sky-400 hover:underline"
          >
            Go to the Scenario builder →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
        {/* Left: scenario info */}
        <div className="space-y-4">
          <Link href="/" className="text-sm text-sky-400 hover:underline">
            ← Back home
          </Link>

          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              {scenario.trackId === 'ra' ? 'RA Scenario' : 'TA Scenario'} ·
              Custom
            </p>
            <h1 className="text-xl font-semibold">{scenario.title}</h1>
            <p className="text-sm text-slate-300">
              {scenario.shortDescription}
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <h2 className="text-sm font-semibold mb-2 text-slate-100">
              Persona notes
            </h2>
            <p className="text-xs text-slate-300 whitespace-pre-wrap">
              {scenario.personaNotes}
            </p>
            <p className="mt-3 text-[11px] text-slate-500">
              These notes help the simulated student/resident respond in a way
              that matches the situation you have in mind.
            </p>
          </div>
        </div>

        {/* Right: chat + controls + feedback */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-100">
              Live conversation
            </h2>
            <p className="text-[11px] text-slate-400">
              You = RA/TA · Sim = student/resident
            </p>
          </div>

          <div className="flex-1 rounded-lg bg-slate-950/60 border border-slate-800 p-3 mb-3 overflow-y-auto space-y-2 text-sm">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500">
                Start the conversation by explaining who you are and asking an
                open-ended question. The simulated student/resident will reply
                based on this custom scenario.
              </p>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    m.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                      m.role === 'user'
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-800 text-slate-50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="mt-auto space-y-2">
            <textarea
              rows={2}
              className="w-full rounded-lg bg-slate-950/70 border border-slate-700 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Type your next response as the RA/TA..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading || ended}
            />
            <div className="flex flex-wrap justify-between items-center gap-2">
              <p className="text-[11px] text-slate-500">
                Use open-ended questions, reflections, and validation.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleEndScenario}
                  disabled={messages.length === 0 || ended}
                  className="rounded-lg border border-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-600/10 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {ended
                    ? 'Feedback generated'
                    : 'End scenario & get feedback'}
                </button>
                <button
                  type="submit"
                  disabled={loading || !input.trim() || ended}
                  className="inline-flex items-center rounded-lg bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sim is responding…' : 'Send'}
                </button>
              </div>
            </div>
          </form>

          {/* Feedback panel */}
          {scores && (
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-950/70 p-3 text-xs">
              <h3 className="font-semibold mb-2 text-slate-100">
                Feedback — {scenario.title}
              </h3>
              <p className="text-[11px] text-slate-400 mb-1">
                Scores (1 = needs work, 5 = strong):
              </p>
              <div className="flex flex-wrap gap-4 mb-3 text-[11px]">
                <span>Empathy: {scores.empathy}/5</span>
                <span>Curiosity: {scores.curiosity}/5</span>
                <span>Structure: {scores.structure}/5</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-200">
                {feedbackNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
