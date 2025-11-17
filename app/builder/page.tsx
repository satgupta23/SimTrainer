'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type TrackId = 'ra' | 'ta';

type CustomScenario = {
  id: string;
  trackId: TrackId;
  title: string;
  shortDescription: string;
  personaNotes: string;
  createdAt: string;
};

const STORAGE_KEY = 'simtrainer.customScenarios.v1';

function slugify(input: string, trackId: TrackId): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  if (!base) return trackId === 'ra' ? 'ra-new-scenario' : 'ta-new-scenario';
  return `${trackId}-${base}`;
}

export default function BuilderPage() {
  const [trackId, setTrackId] = useState<TrackId>('ra');
  const [title, setTitle] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [personaNotes, setPersonaNotes] = useState(
    'Briefly describe how this student/resident tends to talk, what emotions they might show, and any constraints (e.g., do not disclose self-harm, do not ask about diagnosis).'
  );
  const [saved, setSaved] = useState<CustomScenario[]>([]);

  // load saved scenarios on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as CustomScenario[];
      setSaved(parsed);
    } catch (e) {
      console.error('Failed to load saved scenarios', e);
    }
  }, []);

  const autoId = useMemo(
    () => slugify(title || 'new-scenario', trackId),
    [title, trackId]
  );

  const personaPrompt = useMemo(() => {
    if (!title.trim()) return '';

    return `You are role-playing as a ${
      trackId === 'ra' ? 'college resident' : 'student in a university course'
    } in the following scenario:

Title: ${title}
Description: ${shortDescription || '(fill in short description)'}
Additional notes from the training designer:
${personaNotes}

Goals:
- Stay in character as the student/resident at all times.
- Use short replies (1–4 sentences) in a natural, conversational tone.
- Express realistic emotions (stress, frustration, worry, relief) but do not be melodramatic.
- Do NOT coach the other person; you are the one being helped.
- Avoid giving clinical mental health advice or mentioning self-harm.`;
  }, [title, shortDescription, personaNotes, trackId]);

  function handleSave() {
    if (!title.trim() || !shortDescription.trim()) {
      alert('Please fill in a title and short description first.');
      return;
    }

    const id = autoId;
    const scenario: CustomScenario = {
      id,
      trackId,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      personaNotes: personaNotes.trim(),
      createdAt: new Date().toISOString(),
    };

    const existingIndex = saved.findIndex((s) => s.id === id);
    let nextList: CustomScenario[];

    if (existingIndex >= 0) {
      nextList = [...saved];
      nextList[existingIndex] = scenario;
    } else {
      nextList = [scenario, ...saved];
    }

    setSaved(nextList);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextList));
    }

    alert('Scenario saved! You can launch it from the list below.');
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        {/* header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1">Scenario builder</h1>
            <p className="text-sm text-slate-300">
              Design new RA/TA scenarios, save them in this browser, and then
              practice live with the simulator.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-sky-400 hover:underline whitespace-nowrap"
          >
            ← Back home
          </Link>
        </div>

        {/* form */}
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 space-y-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex flex-col text-sm">
              <label className="mb-1 text-slate-300">Track</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTrackId('ra')}
                  className={`px-3 py-1 rounded-lg border text-xs ${
                    trackId === 'ra'
                      ? 'border-sky-500 bg-sky-600 text-white'
                      : 'border-slate-600 bg-slate-800 text-slate-200'
                  }`}
                >
                  RA (Resident Assistant)
                </button>
                <button
                  type="button"
                  onClick={() => setTrackId('ta')}
                  className={`px-3 py-1 rounded-lg border text-xs ${
                    trackId === 'ta'
                      ? 'border-sky-500 bg-sky-600 text-white'
                      : 'border-slate-600 bg-slate-800 text-slate-200'
                  }`}
                >
                  TA (Teaching Assistant)
                </button>
              </div>
            </div>

            <div className="flex flex-col text-sm flex-1 min-w-[220px]">
              <label className="mb-1 text-slate-300">Scenario title</label>
              <input
                className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="e.g., Student panicking about an upcoming exam"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                This also becomes the URL id:&nbsp;
                <code>{autoId}</code>
              </p>
            </div>
          </div>

          <div className="flex flex-col text-sm">
            <label className="mb-1 text-slate-300">Short description</label>
            <textarea
              rows={3}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="One–two sentences describing the situation from the student/resident’s perspective."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col text-sm">
            <label className="mb-1 text-slate-300">
              Persona notes (for AI / simulator)
            </label>
            <textarea
              rows={4}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-50 outline-none focus:ring-2 focus:ring-sky-500"
              value={personaNotes}
              onChange={(e) => setPersonaNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-sky-600 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-500"
            >
              Save scenario in this browser
            </button>
          </div>
        </div>

        {/* outputs: persona prompt + saved list */}
        <div className="grid md:grid-cols-2 gap-4">
          <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-xs">
            <h2 className="font-semibold mb-2 text-sm">
              System prompt you can use for AI
            </h2>
            {personaPrompt ? (
              <pre className="whitespace-pre-wrap break-all bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                {personaPrompt}
              </pre>
            ) : (
              <p className="text-slate-400">
                Add a scenario title to see a suggested system prompt for the
                simulated student/resident.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 text-xs">
            <h2 className="font-semibold mb-2 text-sm">
              Your saved scenarios (this browser only)
            </h2>
            {saved.length === 0 ? (
              <p className="text-slate-400">
                You haven&apos;t saved any scenarios yet. After saving, they
                will appear here with a link to practice.
              </p>
            ) : (
              <ul className="space-y-2">
                {saved.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-[13px]">
                        {s.title}{' '}
                        <span className="text-[10px] uppercase text-slate-400">
                          · {s.trackId.toUpperCase()}
                        </span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {s.shortDescription}
                      </p>
                    </div>
                    <Link
                      href={`/custom/${s.id}`}
                      className="text-[11px] px-3 py-1 rounded-md bg-sky-600 text-white hover:bg-sky-500 whitespace-nowrap"
                    >
                      Start practice
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
