'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, Server, Bell, Check, RefreshCw } from 'lucide-react';

const GUILD_ID = process.env.NEXT_PUBLIC_DISCORD_GUILD_ID || '1169300074115911820';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    guildId: GUILD_ID,
    name: 'Tatakae Labs',
    prefix: '!',
    timezone: 'Asia/Kolkata',
    logChannelId: '',
    modLogChannelId: '',
    welcomeChannelId: '',
    verificationRoleId: '',
  });

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/guilds/${GUILD_ID}/settings`);
      const json = await res.json();
      if (json.success && json.data) {
        setForm((prev) => ({
          ...prev,
          name: json.data.name || prev.name,
          prefix: json.data.prefix || '!',
          timezone: json.data.timezone || 'Asia/Kolkata',
          logChannelId: json.data.logChannelId || '',
          modLogChannelId: json.data.modLogChannelId || '',
          welcomeChannelId: json.data.welcomeChannelId || '',
          verificationRoleId: json.data.verificationRoleId || '',
        }));
      }
    } catch (e) {
      console.error('Failed to load settings from MongoDB:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/guilds/${GUILD_ID}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save settings to MongoDB:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-slate-400" /> Live Platform Configuration
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real MongoDB parameters and Discord dispatch channels for {form.name} ({GUILD_ID}).
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
          title="Reload from MongoDB"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6 backdrop-blur">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-bold text-white">Guild Identity & Regional Defaults</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Discord Guild Snowflake ID
              </label>
              <input
                type="text"
                disabled
                value={form.guildId}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-mono text-sm cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500 mt-1">Configured in .env file</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Timezone (IANA Identifier)
              </label>
              <input
                type="text"
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-cyan-500 outline-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">Used for appointment slot calculations</p>
            </div>
          </div>
        </div>

        {/* Audit & Channel Routing */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-6 backdrop-blur">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Bell className="w-4 h-4 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Discord Channel Snowflake Bindings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Audit Log Channel ID
              </label>
              <input
                type="text"
                value={form.logChannelId}
                placeholder="e.g. 1169300074115911822"
                onChange={(e) => setForm({ ...form, logChannelId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Mod Actions Channel ID
              </label>
              <input
                type="text"
                value={form.modLogChannelId}
                placeholder="e.g. 1169300074115911823"
                onChange={(e) => setForm({ ...form, modLogChannelId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Welcome Notification Channel ID
              </label>
              <input
                type="text"
                value={form.welcomeChannelId}
                placeholder="e.g. 1169300074115911824"
                onChange={(e) => setForm({ ...form, welcomeChannelId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {saved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> Saved directly to MongoDB
            </span>
          )}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
