'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, User, Mail, RefreshCw } from 'lucide-react';

const GUILD_ID = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || '1169300074115911820';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface RealBooking {
  _id: string;
  id: string;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  discordId: string;
  purpose: string;
  startAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  staffDiscordId?: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<RealBooking[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, sRes] = await Promise.all([
        fetch(`${API_URL}/api/guilds/${GUILD_ID}/bookings`),
        fetch(`${API_URL}/api/guilds/${GUILD_ID}/booking-services`),
      ]);
      const bJson = await bRes.json();
      const sJson = await sRes.json();
      if (bJson.success && bJson.data) setBookings(bJson.data);
      if (sJson.success && sJson.data) setServices(sJson.data);
    } catch (e) {
      console.error('Failed to fetch bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API_URL}/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, actorId: 'Admin' }),
      });
      fetchData();
    } catch (err) {
      console.error('Booking status update error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Calendar className="w-6 h-6 text-indigo-400" /> Live Booking & Appointment Management
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real appointments from MongoDB with atomic slot conflict checks.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} /> Refresh
        </button>
      </div>

      {/* Services Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <div className="col-span-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-center text-xs text-slate-500">
            Services will load automatically from MongoDB. Run <code className="text-indigo-400">npm run seed</code> if empty.
          </div>
        ) : (
          services.map((s: any) => (
            <div key={s._id || s.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <span className="text-xs font-semibold text-indigo-400">{s.name}</span>
              <p className="text-sm font-bold text-white mt-1">
                {s.durationMinutes} Mins • {s.bufferMinutes}m Buffer
              </p>
              <p className="text-xs text-slate-400 mt-1">{s.description || 'Active Consultation'}</p>
            </div>
          ))
        )}
      </div>

      {/* Bookings List */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 overflow-hidden backdrop-blur">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Live Scheduled Appointments</h3>
          <span className="text-xs font-mono text-emerald-400">Atomic MongoDB Lock: ACTIVE</span>
        </div>

        {bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            {loading ? (
              <p>Loading real bookings from MongoDB...</p>
            ) : (
              <div>
                <p className="text-slate-300 font-semibold mb-1">No appointments currently booked.</p>
                <p className="text-xs">
                  Members can book appointments directly in Discord using <code className="text-indigo-400">/booking services</code>!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {bookings.map((b) => (
              <div
                key={b._id || b.id}
                className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-900/60 transition"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950/70 border border-indigo-800/60 px-2 py-0.5 rounded">
                      {b.serviceName}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : b.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-300">
                    <span className="font-semibold text-white">{b.clientName}</span>
                    <span className="text-slate-500">•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-500" /> {b.clientEmail}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400 font-mono">@{b.discordId}</span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">Objective:</span> {b.purpose}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-cyan-400 font-medium">
                      <Clock className="w-3.5 h-3.5" /> {new Date(b.startAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(b._id || b.id, 'CONFIRMED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                  )}

                  {b.status !== 'CANCELLED' && (
                    <button
                      onClick={() => handleUpdateStatus(b._id || b.id, 'CANCELLED')}
                      className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-xs font-semibold transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
