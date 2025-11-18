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
      <body className="bg-slate-950 text-slate-50">
        <Providers>
          <TopNav />
          <div className="min-h-[calc(100vh-3rem)] px-4 pb-10">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
