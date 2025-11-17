'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      let message = 'Something went wrong.';
      try {
        const data = await res.json();
        if (data?.error) message = data.error;
      } catch {
        // ignore
      }
      setError(message);
      return;
    }

    router.push('/auth/login');
  }

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl">
        <h1 className="mb-2 text-xl font-semibold text-slate-50">
          Create an account
        </h1>
        <p className="mb-4 text-xs text-slate-400">
          Your account lets you save conversation history across devices.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-sm">
            <label className="text-slate-300">Email</label>
            <input
              type="email"
              className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-700 focus:ring-2 focus:ring-sky-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1 text-sm">
            <label className="text-slate-300">Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-slate-800 px-3 py-2 text-sm text-slate-50 outline-none ring-slate-700 focus:ring-2 focus:ring-sky-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="rounded-md bg-red-900/40 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-xs text-slate-400">
          Already registered?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-sky-400 hover:text-sky-300"
          >
            Sign in
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
