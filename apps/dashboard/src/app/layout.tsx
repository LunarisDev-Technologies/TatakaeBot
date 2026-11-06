import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tatakae Nexus — Discord Administration Platform',
  description: 'Centralized Discord management system and control center for Tatakae Labs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-tatakae-950 text-slate-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

