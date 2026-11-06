'use client';

import React, { useEffect, useState } from 'react';
import {
  Ticket,
  Search,
  Filter,
  CheckCircle,
  Clock,
  User,
  Shield,
  FileText,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const GUILD_ID = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || '1169300074115911820';
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

interface RealTicket {
  _id: string;
  id: string;
  ticketNumber: number;
  categoryName: string;
  creatorUsername: string;
  creatorDiscord: string;
  subject: string;
  status: 'OPEN' | 'CLAIMED' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  staffDiscordId?: string;
  channelId?: string;
  createdAt: string;
}

export default function TicketsPage() {
  const [filter, setFilter] = useState('ALL');
  const [tickets, setTickets] = useState<RealTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/guilds/${GUILD_ID}/tickets`);
      const json = await res.json();
      if (json.success && json.data) {
        setTickets(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch real tickets:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleClaim = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/tickets/${id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffDiscordId: 'Admin' }),
      });
      fetchTickets();
    } catch (err) {
      console.error('Claim error:', err);
    }
  };

  const handleClose = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CLOSED',
          actorId: 'Admin',
          reason: 'Closed via Dashboard',
        }),
      });
      fetchTickets();
    } catch (err) {
      console.error('Close error:', err);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'ALL') return true;
    if (filter === 'UNASSIGNED') return !t.staffDiscordId && t.status !== 'CLOSED';
    return t.status === filter;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Ticket className="w-6 h-6 text-cyan-400" /> Live Ticket Control Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real tickets saved in MongoDB and synchronized with Discord channels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTickets}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/60 border border-slate-800 w-fit text-xs font-semibold">
        {['ALL', 'OPEN', 'CLAIMED', 'IN_PROGRESS', 'UNASSIGNED', 'CLOSED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg transition ${
              filter === tab
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tickets Table / List */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden backdrop-blur">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {loading ? (
              <p>Loading real tickets from database...</p>
            ) : (
              <div>
                <p className="text-slate-300 font-semibold mb-1">No tickets found for filter: {filter}</p>
                <p className="text-xs">
                  Create a ticket in Discord by typing <code className="text-cyan-400">/ticket panel</code> or using the bot!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {filteredTickets.map((t) => (
              <div
                key={t._id || t.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/60 transition"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded">
                      #{t.ticketNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 px-2 py-0.5 rounded bg-slate-800">
                      {t.categoryName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        t.priority === 'URGENT'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : t.priority === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        t.status === 'CLOSED'
                          ? 'bg-slate-800 text-slate-500'
                          : t.status === 'CLAIMED'
                          ? 'bg-indigo-500/20 text-indigo-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-white">{t.subject}</h4>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" /> {t.creatorUsername} ({t.creatorDiscord})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />{' '}
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                    {t.staffDiscordId ? (
                      <span className="flex items-center gap-1 text-indigo-400">
                        <Shield className="w-3.5 h-3.5" /> Staff: @{t.staffDiscordId}
                      </span>
                    ) : (
                      <span className="text-amber-400">⚠️ Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {!t.staffDiscordId && t.status !== 'CLOSED' && (
                    <button
                      onClick={() => handleClaim(t._id || t.id)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                    >
                      Claim Ticket
                    </button>
                  )}

                  {t.status !== 'CLOSED' ? (
                    <button
                      onClick={() => handleClose(t._id || t.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
                    >
                      Close
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-medium">Closed</span>
                  )}

                  <a
                    href={`${API_URL}/api/tickets/${t._id || t.id}/transcript`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition"
                  >
                    <FileText className="w-3.5 h-3.5" /> Transcript
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
