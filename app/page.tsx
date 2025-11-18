// app/page.tsx
import Link from 'next/link';
import { tracks } from '@/data/tracks';

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto py-10 space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-2">SimTrainer</h1>
        <p className="text-slate-300">
          Practice difficult conversations as an RA or TA in a low-stakes environment.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {tracks.map((track) => (
          <article
            key={track.id}
            className="flex flex-col justify-between rounded-xl border border-slate-700 bg-slate-900/70 p-5"
          >
            <div>
              <h2 className="text-xl font-semibold mb-1">{track.name}</h2>
              <p className="text-sm text-slate-300">{track.description}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {track.scenarios.map((scenario) => (
                <Link
                  key={scenario.id}
                  href={`/scenarios/${scenario.id}`}
                  className="text-sm px-3 py-1 rounded-full bg-sky-600 hover:bg-sky-500 text-white"
                >
                  {scenario.title}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
