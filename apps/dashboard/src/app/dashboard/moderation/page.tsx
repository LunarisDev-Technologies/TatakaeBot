'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Clock } from 'lucide-react';

const GUILD_ID = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || '1169300074115911820';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RealCase {
  _id: string;
  id: string;
  caseNumber: number;
  userId: string;
  moderatorId: string;
  action: 'WARN' | 'TIMEOUT' | 'KICK' | 'BAN';
  reason: string;
  durationSeconds?: number;
  createdAt: string;
}

export default function ModerationPage() {
  const [cases, setCases] = useState<RealCase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/guilds/${GUILD_ID}/moderation/cases`);
      const json = await res.json();
      if (json.success && json.data) {
        setCases(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch moderation cases:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-purple-400" /> Live Moderation & Enforcement Center
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real disciplinary cases logged to MongoDB via Discord commands (<code className="text-purple-400">/mod warn</code>, <code className="text-purple-400">/mod timeout</code>, <code className="text-purple-400">/mod kick</code>, <code className="text-purple-400">/mod ban</code>).
          </p>
        </div>

        <button
          onClick={fetchCases}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} /> Refresh
        </button>
      </div>

      {/* AutoMod Protection Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Anti-Spam Filter</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Duplicate & fast-message detection</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Mention Protection</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Max 4 mentions per message</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Invite & Link Filter</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Unauthorized Discord invites blocked</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Raid Shield</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs text-slate-500 mt-2">Join rate threshold verification</p>
        </div>
      </div>

      {/* Cases Log */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden backdrop-blur">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Live Disciplinary Cases</h3>
          <span className="text-xs text-slate-500 font-mono">Append-only MongoDB Collection</span>
        </div>

        {cases.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {loading ? (
              <p>Loading real cases from MongoDB...</p>
            ) : (
              <div>
                <p className="text-slate-300 font-semibold mb-1">No moderation cases recorded yet.</p>
                <p className="text-xs">
                  Issue warnings or timeouts in Discord using <code className="text-purple-400">/mod warn @user</code>!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {cases.map((c) => (
              <div
                key={c._id || c.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/60 transition"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-purple-400 bg-purple-950/70 border border-purple-800/60 px-2 py-0.5 rounded">
                      Case #{c.caseNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        c.action === 'BAN'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : c.action === 'TIMEOUT'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : c.action === 'KICK'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}
                    >
                      {c.action} {c.durationSeconds ? `(${c.durationSeconds / 60}m)` : ''}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold text-white">Target Discord ID:</span>
                    <span className="font-mono text-xs text-slate-300">@{c.userId}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    <span className="text-slate-400">Reason:</span> {c.reason}
                  </p>

                  <p className="text-xs text-slate-500">
                    Enforced by Moderator: <span className="text-purple-300">@{c.moderatorId}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
