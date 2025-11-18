// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'SimTrainer',
  description: 'Conversation practice trainer for RAs and TAs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        <Providers>
          <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <TopNav />
            {/* Main content shell */}
            <div className="mx-auto max-w-6xl px-4 pb-10 pt-6">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
