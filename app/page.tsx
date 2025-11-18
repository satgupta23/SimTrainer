import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="max-w-4xl mx-auto py-10 space-y-10">
      {/* Hero / intro */}
      <section className="space-y-3">
        <p className="text-xs font-semibold tracking-[0.15em] text-sky-400 uppercase">
          Conversation simulator
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-50 sm:text-5xl">
          SimTrainer
        </h1>
        <p className="max-w-2xl text-base text-slate-200 sm:text-lg">
          Practice difficult conversations as an RA or TA in a low-stakes
          environment. Get structured feedback on empathy, curiosity, and how
          clearly you guide the conversation.
        </p>
      </section>

      {/* Three main cards: RA / TA / Build-your-own */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* RA track card – goes to /ra so it can show all (including built) scenarios */}
        <Link
          href="/ra"
          className="group flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40 transition hover:border-sky-500/80 hover:bg-slate-900"
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-50">
              RA track
            </h2>
            <p className="text-xs text-slate-300">
              Practice challenging conversations that resident assistants
              commonly face.
            </p>
          </div>
          <span className="mt-4 text-[11px] font-medium text-sky-300 group-hover:text-sky-200">
            Browse RA scenarios →
          </span>
        </Link>

        {/* TA track card – goes to /ta (DB/builder scenarios still work) */}
        <Link
          href="/ta"
          className="group flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40 transition hover:border-sky-500/80 hover:bg-slate-900"
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-50">
              TA track
            </h2>
            <p className="text-xs text-slate-300">
              Practice conversations around grades, extensions, and academic
              support.
            </p>
          </div>
          <span className="mt-4 text-[11px] font-medium text-sky-300 group-hover:text-sky-200">
            Browse TA scenarios →
          </span>
        </Link>

        {/* Build-your-own card – goes to /builder */}
        <Link
          href="/builder"
          className="group flex flex-col justify-between rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5 shadow-lg shadow-slate-950/40 transition hover:border-emerald-500/80 hover:bg-slate-900"
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-slate-50">
              Build your own
            </h2>
            <p className="text-xs text-slate-300">
              Design custom scenarios tailored to your campus or training
              program.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition group-hover:bg-emerald-400 group-hover:shadow-emerald-800/60">
            Open scenario builder
          </span>
        </Link>
      </section>
    </main>
  );
}
