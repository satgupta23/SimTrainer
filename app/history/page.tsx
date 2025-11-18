import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import HistoryList, { HistoryConversation } from '@/components/HistoryList';

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    redirect('/auth/login?callbackUrl=/history');
  }

  const userId = (session!.user as any).id as string;

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
    select: {
      id: true,
      scenarioTitle: true,
      trackId: true,
      startedAt: true,
      feedbackJson: true,
    },
  });

  const historyItems: HistoryConversation[] = conversations.map((c) => ({
    id: c.id,
    scenarioTitle: c.scenarioTitle,
    trackId: c.trackId,
    startedAt: c.startedAt.toISOString(),
    feedback: c.feedbackJson ? safeParseFeedback(c.feedbackJson) : null,
  }));

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <h1 className="text-2xl font-semibold mb-2">Conversation history</h1>

        <HistoryList initialConversations={historyItems} />
      </div>
    </main>
  );
}

function safeParseFeedback(feedbackJson: string): HistoryConversation['feedback'] {
  try {
    const parsed = JSON.parse(feedbackJson);
    return {
      empathy: typeof parsed?.empathy === 'number' ? parsed.empathy : undefined,
      curiosity: typeof parsed?.curiosity === 'number' ? parsed.curiosity : undefined,
      structure: typeof parsed?.structure === 'number' ? parsed.structure : undefined,
      summary: typeof parsed?.summary === 'string' ? parsed.summary : undefined,
    };
  } catch {
    return null;
  }
}
