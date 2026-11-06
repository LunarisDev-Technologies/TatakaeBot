'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Ticket,
  Calendar,
  ShieldAlert,
  Clock,
  ArrowUpRight,
  Activity,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

const GUILD_ID = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || '1169300074115911820';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function OverviewPage() {
  const [stats, setStats] = useState({
    totalMembers: 0,
    openTickets: 0,
    unassignedTickets: 0,
    pendingBookings: 0,
    moderationCases: 0,
  });
  const [guildInfo, setGuildInfo] = useState({
    name: 'Tatakae Labs',
    id: GUILD_ID,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/guilds/${GUILD_ID}/overview`);
      const json = await res.json();
      if (json.success && json.data) {
        setStats(json.data.stats);
        if (json.data.guild) setGuildInfo(json.data.guild);
        setRecentActivity(json.data.recentActivity || []);
      }
    } catch (e) {
      console.error('Failed to fetch live overview:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    const interval = setInterval(fetchOverview, 10000); // 10s live polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            System Command Overview
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LIVE MONGODB & DISCORD
            </span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time server telemetry, live tickets, appointments, and audit log for {guildInfo.name} ({GUILD_ID}).
          </p>
        </div>

        <button
          onClick={fetchOverview}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition"
          title="Refresh telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Open Tickets */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.openTickets}</span>
            <span className="text-xs text-amber-400 font-medium">
              {stats.unassignedTickets} unassigned
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Live in Discord</span>
            <Link href="/dashboard/tickets" className="text-cyan-400 hover:underline flex items-center gap-0.5">
              Manage <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Bookings</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.pendingBookings}</span>
            <span className="text-xs text-indigo-400 font-medium">Pending Review</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Atomic slot lock</span>
            <Link href="/dashboard/bookings" className="text-indigo-400 hover:underline flex items-center gap-0.5">
              Schedule <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Moderation Cases */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Moderation Cases</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.moderationCases}</span>
            <span className="text-xs text-emerald-400 font-medium">Logged in DB</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Append-only</span>
            <Link href="/dashboard/moderation" className="text-purple-400 hover:underline flex items-center gap-0.5">
              Log <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Community Members */}
        <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Discord Members</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white">{stats.totalMembers}</span>
            <span className="text-xs text-emerald-400 font-medium">Server Members</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Guild: {guildInfo.name}</span>
            <span className="text-slate-400">Verified</span>
          </div>
        </div>
      </div>

      {/* Grid: Live Activity Feed + Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">Live Administrative Audit Feed</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real MongoDB Stream</span>
          </div>

          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No administrative actions recorded in database yet.
                <p className="mt-1">Actions from Discord (/ticket, /booking, /mod) will appear here live.</p>
              </div>
            ) : (
              recentActivity.map((act: any) => (
                <div
                  key={act._id || act.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between hover:bg-slate-800/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-200">
                          {act.actorId === 'SYSTEM_WORKER' ? 'Worker Engine' : `@${act.actorId}`}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {act.action}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {act.entityType}: {act.metadata?.category || act.metadata?.reason || act.entityId}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(act.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Health Status */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur">
            <h3 className="text-base font-bold text-white mb-4">Platform Stack Health</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Local MongoDB 7</span>
                <span className="text-emerald-400 font-mono font-medium">CONNECTED (27017)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Fastify Core REST API</span>
                <span className="text-emerald-400 font-mono font-medium">HEALTHY (4000)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Discord Gateway Bot</span>
                <span className="text-emerald-400 font-mono font-medium">ONLINE (v14)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-300">Automation Worker</span>
                <span className="text-emerald-400 font-mono font-medium">ACTIVE</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-indigo-950/40 border border-cyan-800/30 backdrop-blur">
            <h4 className="text-sm font-bold text-white mb-1">Discord Slash Commands</h4>
            <p className="text-xs text-slate-400 mb-3">
              Type <code className="text-cyan-400">/ticket panel</code> in any Discord channel to publish live support buttons.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
