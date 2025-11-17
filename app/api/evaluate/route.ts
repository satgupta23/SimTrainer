import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { messages } = await req.json().catch(() => ({ messages: [] as any[] }));

  const turns = Array.isArray(messages)
    ? messages.filter((m: any) => m.role === 'user')
    : [];

  const totalChars = turns.reduce(
    (sum: number, m: any) => sum + (m.content?.length ?? 0),
    0
  );
  const questions = turns.filter((m: any) =>
    (m.content as string).includes('?')
  ).length;

  const empathy = totalChars > 350 ? 5 : totalChars > 200 ? 4 : 3;
  const curiosity = questions >= 4 ? 5 : questions >= 2 ? 4 : 3;
  const structure = turns.length >= 5 ? 5 : turns.length >= 3 ? 4 : 3;

  return NextResponse.json({ empathy, curiosity, structure });
}
