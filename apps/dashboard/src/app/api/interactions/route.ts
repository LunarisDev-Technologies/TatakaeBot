import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';

const DEFAULT_PUBLIC_KEY = '74ff25a99089dbfcf22925a497a9e7bfc5603b466cce1e959113dc508e6908a7';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-signature-ed25519');
    const timestamp = req.headers.get('x-signature-timestamp');
    const rawBody = await req.text();
    const publicKey = process.env.DISCORD_PUBLIC_KEY || process.env.PUBLIC_KEY || DEFAULT_PUBLIC_KEY;

    if (!signature || !timestamp || !rawBody) {
      return new NextResponse('Invalid request signature', { status: 401 });
    }

    try {
      const message = Buffer.concat([Buffer.from(timestamp), Buffer.from(rawBody)]);
      const sig = Buffer.from(signature, 'hex');
      const pubKey = Buffer.from(publicKey, 'hex');

      if (sig.length !== 64 || pubKey.length !== 32) {
        return new NextResponse('Invalid request signature', { status: 401 });
      }

      const isVerified = nacl.sign.detached.verify(message, sig, pubKey);
      if (!isVerified) {
        return new NextResponse('Invalid request signature', { status: 401 });
      }
    } catch {
      return new NextResponse('Invalid request signature', { status: 401 });
    }

    let interaction: any;
    try {
      interaction = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Invalid JSON body', { status: 400 });
    }

    // 1. Handle PING (Type 1) - Required for Discord Interactions URL verification
    if (interaction.type === 1) {
      return NextResponse.json({ type: 1 });
    }

    // 2. Handle Application Commands (Slash Commands - Type 2)
    if (interaction.type === 2) {
      const commandName = interaction.data?.name;

      if (commandName === 'ping') {
        return NextResponse.json({
          type: 4,
          data: {
            content: '🏓 Pong! Tatakae Nexus is running 24/7 on Vercel Serverless!',
          },
        });
      }

      if (commandName === 'dashboard') {
        return NextResponse.json({
          type: 4,
          data: {
            content: '🔗 Click below to access your Tatakae Nexus Web Control Center:\nhttps://tatakaebot.vercel.app/dashboard',
            flags: 64,
          },
        });
      }

      return NextResponse.json({
        type: 4,
        data: {
          content: `⚡ Command \`/${commandName}\` executed via Vercel Serverless.`,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Tatakae Nexus Serverless Discord Interactions',
    timestamp: new Date().toISOString(),
  });
}
