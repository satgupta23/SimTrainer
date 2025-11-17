import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const conversations = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
  });

  return NextResponse.json(conversations);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !(session.user as any).id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ error: 'Bad JSON' }, { status: 400 });
  }

  const {
    trackId,
    scenarioId,
    scenarioTitle,
    messages,
    feedback,
  } = body as {
    trackId?: string;
    scenarioId?: string;
    scenarioTitle?: string;
    messages?: any[];
    feedback?: any;
  };

  if (!trackId || !scenarioId || !scenarioTitle || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const conversation = await prisma.conversation.create({
    data: {
      userId,
      trackId,
      scenarioId,
      scenarioTitle,
      messagesJson: JSON.stringify(messages),
      feedbackJson: feedback ? JSON.stringify(feedback) : null,
      startedAt: new Date(),
      endedAt: new Date(),
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
