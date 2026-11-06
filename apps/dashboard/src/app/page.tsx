import Link from 'next/link';
import { Shield, Sparkles, Calendar, Ticket, ChevronRight, Terminal } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-tatakae-950 text-slate-100">
      {/* Navbar */}
      <header className="border-b border-slate-800/80 bg-tatakae-900/60 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20">
              TN
            </div>
            <span className="font-bold text-lg tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-300">
              TATAKAE NEXUS
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-tatakae-800 hover:bg-tatakae-700 text-slate-200 border border-slate-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
            >
              Dashboard <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0,transparent_70%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-8 backdrop-blur">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Enterprise Discord Management Platform v1.0
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold max-w-4xl tracking-tight leading-tight">
          One Unified Control Center for{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
            Tatakae Labs
          </span>
        </h1>

        <p className="mt-6 text-slate-400 max-w-2xl text-base md:text-lg leading-relaxed">
          Manage support tickets, client consultations, automated moderation, member profiles, and server automation through a single, database-backed platform.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] transition flex items-center gap-2"
          >
            Open Control Center <ChevronRight className="w-4 h-4" />
          </Link>
          <a
            href="http://localhost:4000/docs"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 font-semibold text-sm border border-slate-700 transition flex items-center gap-2"
          >
            <Terminal className="w-4 h-4 text-cyan-400" /> API Documentation
          </a>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur hover:border-cyan-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Ticket className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Priority Ticket Workflows</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Database-backed ticket lifecycle with assignment, live Discord transcripts, staff claim controls, and resolution metrics.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur hover:border-indigo-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Booking & Appointments</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Consultation and demo scheduling with atomic slot locking to strictly prevent double bookings across staff.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur hover:border-purple-500/30 transition">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Moderation & Safety</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Granular warning points, timeouts, kicks, bans, and full audit logs with server-side authorization enforcement.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

