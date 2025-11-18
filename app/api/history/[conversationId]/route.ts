import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type UpdateBody = {
  scenarioId?: string;
  scenarioTitle?: string;
  trackId?: string;
  messages?: any[];
  feedback?: any;
};

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function PUT(req: Request, context: RouteContext) {
  const { conversationId } = await context.params;
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const existing = await prisma.conversation.findFirst({
    where: { id: conversationId, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }

  const body = (await req.json().catch(() => null)) as UpdateBody | null;

  if (!body || !Array.isArray(body.messages)) {
    return NextResponse.json({ error: 'Missing messages' }, { status: 400 });
  }

  const { messages, feedback, scenarioId, scenarioTitle, trackId } = body;

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      messagesJson: JSON.stringify(messages),
      feedbackJson: feedback ? JSON.stringify(feedback) : null,
      scenarioId: scenarioId ?? existing.scenarioId,
      scenarioTitle: scenarioTitle ?? existing.scenarioTitle,
      trackId: trackId ?? existing.trackId,
      endedAt: new Date(),
    },
  });

  return NextResponse.json({ updated: true });
}
