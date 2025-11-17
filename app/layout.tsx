import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import TopNav from '@/components/TopNav';

export const metadata: Metadata = {
  title: 'SimTrainer',
  description: 'Practice tough RA / TA conversations in a safe space.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-50">
        <Providers>
          <TopNav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
