import Link from 'next/link';
import ChatPanel from './ChatPanel';

export type ScenarioConfig = {
  id: string;
  title: string;
  shortDescription: string;
  openingLine: string;
};

interface ScenarioScreenProps {
  trackId: 'ra' | 'ta';
  scenario: ScenarioConfig;
}

export default function ScenarioScreen({ trackId, scenario }: ScenarioScreenProps) {
  const backHref = trackId === 'ra' ? '/ra' : '/ta';

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <Link href={backHref} className="text-sm text-sky-400 hover:underline">
            ← Back to {trackId.toUpperCase()} track
          </Link>
        </div>

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">{scenario.title}</h1>
          <p className="text-slate-300 text-sm">{scenario.shortDescription}</p>
        </header>

        <section className="mt-6">
          <ChatPanel
            trackId={trackId}
            scenarioId={scenario.id}
            scenarioTitle={scenario.title}
            openingLine={scenario.openingLine}
          />
        </section>
      </div>
    </main>
  );
}
