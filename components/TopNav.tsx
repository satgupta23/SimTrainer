'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function TopNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // If you really want to hide nav on auth pages you can use this,
  // but for now we keep it visible.
  const isAuthPage =
    pathname?.startsWith('/auth/login') ||
    pathname?.startsWith('/auth/register');

  return (
    <header className="border-b border-slate-800 bg-slate-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold text-slate-50">
          SimTrainer
        </Link>

        {!isAuthPage && (
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/history"
              className="text-slate-300 hover:text-sky-400 transition-colors"
            >
              View history
            </Link>
            <Link
              href="/builder"
              className="text-slate-300 hover:text-sky-400 transition-colors"
            >
              Scenario builder
            </Link>

            {status === 'authenticated' ? (
              <>
                <span className="text-xs text-slate-400">
                  {session?.user?.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="rounded-md border border-slate-600 px-3 py-1 text-xs text-slate-50 hover:bg-slate-800"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-md bg-sky-600 px-3 py-1 text-xs font-medium text-white hover:bg-sky-500"
              >
                Sign in
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
