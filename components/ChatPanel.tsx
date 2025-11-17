// components/ChatPanel.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type Feedback = {
  empathy: number;
  curiosity: number;
  structure: number;
};

type ChatPanelProps = {
  scenarioId: string;
};

function getTrackIdFromScenarioId(id: string): string {
  if (id.startsWith('ra-')) return 'ra';
  if (id.startsWith('ta-')) return 'ta';
  return 'custom';
}

function titleFromScenarioId(id: string): string {
  return id
    .replace(/^(ra-|ta-)/, '')
    .split('-')
    .map((w) => (w[0] ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

export default function ChatPanel({ scenarioId }: ChatPanelProps) {
  const { data: session } = useSession();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hasSaved, setHasSaved] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const startedAtRef = useRef<string | null>(null);

  useEffect(() => {
    // reset when scenario changes
    startedAtRef.current = new Date().toISOString();
    setMessages([]);
    setFeedback(null);
    setHasSaved(false);
    setSavingError(null);
    setInput('');
  }, [scenarioId]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const newMessage: ChatMessage = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, newMessage];
    setMessages(nextMessages);
    setInput('');

    setIsSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, scenarioId }),
      });

      if (!res.ok) {
        console.error('Chat error', await res.text());
        setIsSending(false);
        return;
      }

      const data = await res.json();
      const reply: ChatMessage = {
        role: 'assistant',
        content: data.reply ?? '',
      };
      const updated = [...nextMessages, reply];
      setMessages(updated);

      // update feedback
      const fbRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });

      if (fbRes.ok) {
        const fb = (await fbRes.json()) as Feedback;
        setFeedback(fb);
      }
    } catch (err) {
      console.error('Send error', err);
    } finally {
      setIsSending(false);
    }
  }

  async function handleEndScenario() {
    if (!session?.user || !(session.user as any).id) {
      setSavingError('You must sign in to save this conversation.');
      return;
    }

    if (messages.length === 0) {
      setSavingError('No messages to save.');
      return;
    }

    setSavingError(null);

    const trackId = getTrackIdFromScenarioId(scenarioId);
    const scenarioTitle = titleFromScenarioId(scenarioId);
    const startedAt = startedAtRef.current ?? new Date().toISOString();
    const endedAt = new Date().toISOString();

    const res = await fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trackId,
        scenarioId,
        scenarioTitle,
        messages,
        feedback,
        startedAt,
        endedAt,
      }),
    });

    if (!res.ok) {
      console.error('Failed to save conversation', await res.text());
      setSavingError('Failed to save conversation.');
      setHasSaved(false);
    } else {
      setHasSaved(true);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Chat window */}
      <div className="flex-1 min-h-[260px] rounded-xl border border-slate-700 bg-slate-900/70 p-4 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-slate-400">
            Start the conversation by typing a response below.
          </p>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-sky-600 text-white'
                : 'mr-auto bg-slate-800 text-slate-50'
            }`}
          >
            {m.content}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Type your reply as the RA/TA…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="px-4 py-2 rounded-lg bg-sky-600 text-sm text-white disabled:opacity-50"
        >
          {isSending ? 'Sending…' : 'Send'}
        </button>
      </form>

      {/* Footer: save + feedback */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEndScenario}
            className="px-3 py-2 rounded-lg bg-emerald-600 text-xs text-white disabled:opacity-50"
          >
            End scenario &amp; save
          </button>
          {hasSaved && (
            <span className="text-xs text-emerald-400">
              Saved to your history.
            </span>
          )}
          {!session?.user && (
            <span className="text-xs text-slate-400">
              Sign in to save this conversation.
            </span>
          )}
          {savingError && (
            <span className="text-xs text-rose-400">{savingError}</span>
          )}
        </div>

        <div className="text-xs text-slate-300">
          <span className="font-semibold mr-2">Feedback</span>
          {feedback ? (
            <>
              Empathy: {feedback.empathy}/5 • Curiosity:{' '}
              {feedback.curiosity}/5 • Structure: {feedback.structure}/5
            </>
          ) : (
            <>Feedback appears here as you talk.</>
          )}
        </div>
      </div>
    </div>
  );
}
