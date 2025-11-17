'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { tracks } from '@/data/tracks';

type TrackId = 'ra' | 'ta';

type CustomScenario = {
  id: string;
  trackId: TrackId;
  title: string;
  shortDescription: string;
};

const STORAGE_KEY = 'simtrainer.customScenarios.v1';

export default function TAPage() {
  const taTrack = tracks.find((t) => t.id === 'ta');
  const [customScenarios, setCustomScenarios] = useState<CustomScenario[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const all = JSON.parse(raw) as CustomScenario[];
      setCustomScenarios(all.filter((s) => s.trackId === 'ta'));
    } catch (e) {
      console.error('Failed to load custom scenarios', e);
    }
  }, []);

  if (!taTrack) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <p>TA track not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <Link href="/" className="text-sm text-sky-400 hover:underline">
          ← Back home
        </Link>

        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">{taTrack.name}</h1>
          <p className="text-sm text-slate-300">{taTrack.description}</p>
        </header>

        {/* Built-in scenarios */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">
            Built-in practice scenarios
          </h2>
          <div className="space-y-2">
            {taTrack.scenarios.map((scenario) => (
              <Link
                key={scenario.id}
                href={`/scenarios/${scenario.id}`}
                className="block rounded-lg border border-slate-700 bg-slate-900/70 px-4 py-3 hover:border-sky-500 hover:bg-slate-900 transition"
              >
                <h3 className="font-medium text-sm mb-1">
                  {scenario.title}
                </h3>
                <p className="text-xs text-slate-300">
                  {scenario.shortDescription}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Custom scenarios saved in this browser */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200">
              My saved TA scenarios (this browser)
            </h2>
            <Link
              href="/builder"
              className="text-xs text-sky-400 hover:underline"
            >
              + New scenario
            </Link>
          </div>

          {customScenarios.length > 0 ? (
            <div className="space-y-2">
              {customScenarios.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/custom/${scenario.id}`}
                  className="block rounded-lg border border-slate-600 bg-slate-900/60 px-4 py-3 hover:border-sky-400 hover:bg-slate-900 transition"
                >
                  <h3 className="font-medium text-sm mb-1">
                    {scenario.title}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {scenario.shortDescription}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Custom scenario (stored only in this browser)
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No custom TA scenarios yet. Use the{' '}
              <Link href="/builder" className="text-sky-400 hover:underline">
                Scenario builder
              </Link>{' '}
              to add situations you want to rehearse.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
