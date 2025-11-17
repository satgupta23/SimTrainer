import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    redirect('/auth/login?callbackUrl=/history');
  }

  const userId = (session!.user as any).id as string;

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        <h1 className="text-2xl font-semibold mb-2">Conversation history</h1>

        {conversations.length === 0 && (
          <p className="text-sm text-slate-400">
            You haven&apos;t saved any conversations yet.
          </p>
        )}

        <ul className="space-y-3">
          {conversations.map((c) => (
            <li
              key={c.id}
              className="rounded-lg border border-slate-800 bg-slate-900/70 p-4 text-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-50">
                    {c.scenarioTitle}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(c.startedAt).toLocaleString()}
                  </p>
                </div>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300">
                  {c.trackId}
                </span>
              </div>

              {c.feedbackJson && (
                <div className="mt-2 flex gap-4 text-xs text-slate-300">
                  {(() => {
                    const fb = JSON.parse(c.feedbackJson as string);
                    return (
                      <>
                        <span>Empathy: {fb.empathy}/5</span>
                        <span>Curiosity: {fb.curiosity}/5</span>
                        <span>Structure: {fb.structure}/5</span>
                      </>
                    );
                  })()}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
