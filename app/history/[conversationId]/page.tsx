import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import ChatPanel, { ChatMessage, Feedback } from '@/components/ChatPanel';
import { SCENARIOS, ScenarioId, getScenario } from '@/data/tracks';

type PageProps = {
  params: Promise<{ conversationId: string }>;
};

export default async function ConversationDetailPage({ params }: PageProps) {
  const { conversationId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    redirect(`/auth/login?callbackUrl=/history/${conversationId}`);
  }

  const userId = (session!.user as any).id as string;

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!conversation) {
    notFound();
  }

  const messages = parseMessages(conversation.messagesJson);
  const parsedFeedback = parseFeedback(conversation.feedbackJson);
  const startedIso = conversation.startedAt.toISOString();
  const endedIso = conversation.endedAt?.toISOString();

  const scenario = isScenarioId(conversation.scenarioId)
    ? getScenario(conversation.scenarioId as ScenarioId) ?? null
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Link href="/history" className="text-sm text-sky-400 hover:underline">
          Back to history
        </Link>

        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Saved conversation
          </p>
          <h1 className="text-2xl font-semibold text-slate-50">
            {conversation.scenarioTitle}
          </h1>
          <div className="flex flex-wrap gap-3 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700 px-2 py-0.5 uppercase tracking-wide text-slate-200">
              {conversation.trackId}
            </span>
            <span>
              Started:{' '}
              <time suppressHydrationWarning dateTime={startedIso}>
                {new Date(startedIso).toLocaleString()}
              </time>
            </span>
            {endedIso && (
              <span>
                Last updated:{' '}
                <time suppressHydrationWarning dateTime={endedIso}>
                  {new Date(endedIso).toLocaleString()}
                </time>
              </span>
            )}
          </div>
          <p className="text-sm text-slate-400">
            Click back into the conversation below to review every message, pick
            up where you left off, or reset the scenario.
          </p>
        </header>

        {scenario ? (
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-200">
              Continue conversation
            </h2>
            <ChatPanel
              scenarioId={scenario.id}
              conversationId={conversation.id}
              initialMessages={messages}
              initialFeedback={parsedFeedback}
            />
          </section>
        ) : (
          <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
            <div className="rounded-md border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
              <p className="font-medium">Scenario unavailable</p>
              <p className="text-amber-50/80">
                This conversation was created from a custom scenario that lives
                only in the browser where it was written, so it can't be
                reopened here. You can still review the transcript and feedback
                below.
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-sm space-y-3">
              {messages.length === 0 ? (
                <p className="text-slate-400">No messages were saved.</p>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${
                        msg.role === 'user'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-50'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            {parsedFeedback && (
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2">
                <div className="flex flex-wrap gap-4 text-slate-200">
                  <span>Empathy: {parsedFeedback.empathy ?? 'N/A'}/5</span>
                  <span>Curiosity: {parsedFeedback.curiosity ?? 'N/A'}/5</span>
                  <span>Structure: {parsedFeedback.structure ?? 'N/A'}/5</span>
                </div>
                {parsedFeedback.summary && (
                  <p className="text-slate-300 whitespace-pre-line">
                    {parsedFeedback.summary}
                  </p>
                )}
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}

function isScenarioId(id: string): id is ScenarioId {
  return SCENARIOS.some((scenario) => scenario.id === id);
}

function parseMessages(raw: string): ChatMessage[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed
        .filter(
          (item) =>
            item &&
            typeof item.role === 'string' &&
            typeof item.content === 'string'
        )
        .map((item) => ({
          role: item.role === 'user' ? 'user' : 'assistant',
          content: item.content as string,
        }));
    }
  } catch {
    // ignore
  }
  return [];
}

function parseFeedback(raw: string | null): Feedback | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      empathy: typeof parsed?.empathy === 'number' ? parsed.empathy : 0,
      curiosity: typeof parsed?.curiosity === 'number' ? parsed.curiosity : 0,
      structure: typeof parsed?.structure === 'number' ? parsed.structure : 0,
      summary: typeof parsed?.summary === 'string' ? parsed.summary : '',
    };
  } catch {
    return null;
  }
}
