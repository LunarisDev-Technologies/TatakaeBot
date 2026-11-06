'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Ticket,
  Calendar,
  ShieldAlert,
  Settings,
  Users,
  Radio,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const navigationItems = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Ticket Management', href: '/dashboard/tickets', icon: Ticket },
  { name: 'Booking & Scheduling', href: '/dashboard/bookings', icon: Calendar },
  { name: 'Moderation', href: '/dashboard/moderation', icon: ShieldAlert },
  { name: 'Server Settings', href: '/dashboard/settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-tatakae-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-tatakae-900/40 flex flex-col justify-between backdrop-blur-md">
        <div>
          {/* Logo & Guild Brand */}
          <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-500/20">
                TN
              </div>
              <div>
                <h1 className="font-bold text-sm tracking-wide text-white">TATAKAE NEXUS</h1>
                <p className="text-[11px] text-slate-400">Server Control Center</p>
              </div>
            </div>
          </div>

          {/* Server Status Pill */}
          <div className="px-6 py-4">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-200">Tatakae Labs</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ONLINE
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-500/10 text-cyan-400 border border-cyan-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User / Footer */}
        <div className="p-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/40 border border-slate-800/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                AD
              </div>
              <div>
                <p className="text-xs font-semibold text-white leading-tight">Admin</p>
                <p className="text-[10px] text-slate-400">Master Authority</p>
              </div>
            </div>
            <Link href="/" className="text-slate-400 hover:text-slate-200" title="Back to home">
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800/80 bg-tatakae-900/20 backdrop-blur px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/50">
              CLUSTER: tatakae-central-01
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-400 hover:text-cyan-400 transition flex items-center gap-1.5"
            >
              REST API Docs <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}

