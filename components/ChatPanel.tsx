// components/ChatPanel.tsx
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import type { ScenarioId, Scenario } from '@/data/tracks';
import { getScenario } from '@/data/tracks';

export type ChatMessage = {
  role: 'user' | 'assistant'; // user = RA/TA, assistant = student
  content: string;
};

export type Feedback = {
  empathy: number;
  curiosity: number;
  structure: number;
  summary: string;
};

type ChatPanelProps = {
  scenarioId: ScenarioId;
  conversationId?: string;
  initialMessages?: ChatMessage[] | null;
  initialFeedback?: Feedback | null;
};

export default function ChatPanel({
  scenarioId,
  conversationId,
  initialMessages = null,
  initialFeedback = null,
}: ChatPanelProps) {
  const { data: session } = useSession();

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const seededMessages = useMemo(
    () => (initialMessages && initialMessages.length > 0 ? initialMessages : null),
    [conversationId, initialMessages]
  );

  const seededFeedback = useMemo(
    () => (initialFeedback ? initialFeedback : null),
    [conversationId, initialFeedback]
  );

  // Load scenario + initial student line
  useEffect(() => {
    const s = getScenario(scenarioId);
    if (!s) {
      setScenario(null);
      setMessages([]);
      setFeedback(null);
      return;
    }

    setScenario(s);
    if (seededMessages) {
      setMessages(seededMessages);
      setFeedback(seededFeedback ?? null);
    } else {
      setMessages([
        {
          role: 'assistant',
          content: s.openingLine,
        },
      ]);
      setFeedback(null);
    }

    setHasSaved(false);
    setInput('');
  }, [scenarioId, conversationId, seededMessages, seededFeedback]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setHasSaved(false);
    setInput('');
    setIsSending(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId, messages: nextMessages }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Chat error response:', res.status, text);

        // Don't crash the app – show a graceful message
        setMessages([
          ...nextMessages,
          {
            role: 'assistant',
            content:
              "Sorry—I'm having trouble connecting to the AI server right now.",
          },
        ]);
        return;
      }

      const data = await res.json();

      if (data.reply) {
        setMessages([
          ...nextMessages,
          { role: 'assistant', content: data.reply as string },
        ]);
      }
    } catch (err) {
      console.error('Chat error', err);
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            "Sorry—something went wrong while talking to the AI. Please try again.",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  async function persistConversation(messagesToPersist: ChatMessage[], feedbackToPersist: Feedback | null) {
    if (!session?.user || !scenario) return;

    const payload = {
      scenarioId,
      trackId: scenario.trackId,
      scenarioTitle: scenario.title,
      messages: messagesToPersist,
      feedback: feedbackToPersist,
    };

    const endpoint = conversationId ? `/api/history/${conversationId}` : '/api/history';
    const method = conversationId ? 'PUT' : 'POST';

    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || 'Failed to save conversation');
    }
  }

  async function handleEndScenario() {
    if (!messages.length || isSending || hasSaved) return;

    setIsSending(true);

    try {
      // 1) Get feedback (our custom heuristic, NOT OpenAI)
      const evalRes = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId, messages }),
      });

      if (!evalRes.ok) throw new Error('Evaluate error');

      const evalData = await evalRes.json();
      const newFeedback: Feedback = evalData.feedback;
      setFeedback(newFeedback);

      // 2) If logged in, save conversation to history (create or update)
      if (session?.user && scenario) {
        await persistConversation(messages, newFeedback);
        setHasSaved(true);
      }
    } catch (err) {
      console.error('Failed to save conversation', err);
    } finally {
      setIsSending(false);
    }
  }

  async function handleResetConversation() {
    if (!scenario || !conversationId) return;
    if (typeof window !== 'undefined') {
      const confirmReset = window.confirm(
        'Reset this conversation and start over from the opening line? This will overwrite the saved conversation history.'
      );
      if (!confirmReset) return;
    }

    const startingMessages: ChatMessage[] = [
      { role: 'assistant', content: scenario.openingLine },
    ];

    setMessages(startingMessages);
    setFeedback(null);
    setInput('');
    setHasSaved(false);
    setIsSending(true);

    try {
      await persistConversation(startingMessages, null);
    } catch (err) {
      console.error('Failed to reset conversation', err);
    } finally {
      setIsSending(false);
    }
  }

  const saveButtonLabel = conversationId
    ? hasSaved
      ? 'Updates saved'
      : 'Save progress'
    : hasSaved
    ? 'Saved to your history'
    : 'End scenario & save';

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Chat window */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/70 p-4 space-y-3">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === 'user'
                ? 'ml-auto bg-sky-600 text-white'
                : 'mr-auto bg-slate-800 text-slate-50'
            }`}
          >
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="Type your reply as the RA/TA…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          Send
        </button>
      </form>

      {/* Footer: end + numeric feedback */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleEndScenario}
          disabled={isSending || hasSaved}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {saveButtonLabel}
        </button>
        {conversationId && scenario && (
          <button
            type="button"
            onClick={handleResetConversation}
            disabled={isSending}
            className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-medium text-slate-200 hover:border-rose-400 hover:text-rose-200 disabled:opacity-60"
          >
            Reset conversation
          </button>
        )}

        <p className="text-xs text-slate-400">
          {feedback ? (
            <>
              Feedback:&nbsp;
              Empathy: {feedback.empathy}/5 • Curiosity: {feedback.curiosity}/5 •
              Structure: {feedback.structure}/5
            </>
          ) : (
            <>Feedback will appear after you end the scenario.</>
          )}
        </p>
      </div>

      {/* Wordy feedback */}
      {feedback && feedback.summary && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/80 p-3 text-sm text-slate-100">
          <p className="font-medium mb-1">Detailed feedback</p>
          <p>{feedback.summary}</p>
        </div>
      )}
    </div>
  );
}
