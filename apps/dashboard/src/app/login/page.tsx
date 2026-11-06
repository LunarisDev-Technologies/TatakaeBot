import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const discordClientId = process.env.DISCORD_CLIENT_ID || '100000000000000000';
  const redirectUri = encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/discord'
  );
  const discordOAuthUrl = `https://discord.com/oauth2/authorize?client_id=${discordClientId}&response_type=code&redirect_uri=${redirectUri}&scope=identify+guilds+guilds.members.read`;

  return (
    <div className="min-h-screen bg-tatakae-950 flex flex-col items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0,transparent_60%)] pointer-events-none" />

      <Link
        href="/"
        className="absolute top-8 left-8 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="w-full max-w-md p-8 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl shadow-2xl text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-500/25 mb-6">
          TN
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">Sign In to Tatakae Nexus</h2>
        <p className="mt-2 text-sm text-slate-400">
          Authenticate with your Discord account to access the administration and moderation controls.
        </p>

        <div className="mt-8 space-y-4">
          <a
            href={discordOAuthUrl}
            className="w-full py-3.5 px-4 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold text-sm flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/20 transition"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Sign in with Discord
          </a>

          <Link
            href="/dashboard"
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center transition"
          >
            Bypass to Dashboard (Local Dev Mode)
          </Link>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Dashboard access is granted strictly according to configured staff role permissions.
        </p>
      </div>
    </div>
  );
}

