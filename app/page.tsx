import Link from 'next/link';
import { tracks } from '@/data/tracks';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* Header row */}
        <div className="flex items-start justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-semibold mb-3">
              Practice tough conversations in a safe space.
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              SimTrainer lets RAs and TAs rehearse realistic conversations with
              simulated students and residents, then get structured feedback.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-sm">
            <Link
              href="/history"
              className="text-sky-400 hover:text-sky-300 hover:underline"
            >
              View history
            </Link>
          </div>
        </div>

        <div className="flex items-baseline justify-between mb-4 gap-4">
          <h2 className="text-xl font-semibold">
            Choose a training track
          </h2>
          <span className="text-xs text-slate-400">
            or design your own scenario
          </span>
        </div>

        {/* Track cards + builder card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tracks.map((track) => (
            <Link key={track.id} href={`/${track.id}`} className="group">
              <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-4 hover:border-sky-500 hover:bg-slate-900 transition flex flex-col justify-between cursor-pointer">
                <h3 className="font-semibold mb-1">{track.name}</h3>
                <p className="text-sm text-slate-300">
                  {track.description}
                </p>
              </div>
            </Link>
          ))}

          {/* Scenario builder card */}
          <Link href="/builder" className="group">
            <div className="rounded-xl border-2 border-dashed border-sky-600/70 bg-slate-900/40 p-4 hover:border-sky-400 hover:bg-slate-900 transition flex flex-col justify-between cursor-pointer">
              <p className="text-xs uppercase tracking-wide text-sky-400 mb-1">
                Create new
              </p>
              <h3 className="font-semibold mb-1">
                Design a custom scenario
              </h3>
              <p className="text-sm text-slate-300">
                Build your own RA or TA conversation, then plug it into the
                trainer with a single copy-paste.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
