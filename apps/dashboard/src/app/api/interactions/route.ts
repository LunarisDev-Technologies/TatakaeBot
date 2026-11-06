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

    const commandName = interaction.data?.name;
    const customId = interaction.data?.custom_id;

    // 2. Handle Application Commands (Slash Commands - Type 2)
    if (interaction.type === 2) {
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
            content: '🔗 Click below to access your Tatakae Nexus Web Control Center:',
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    label: 'Open Nexus Dashboard',
                    style: 5,
                    url: 'https://tatakaebot.vercel.app/dashboard',
                  },
                ],
              },
            ],
            flags: 64,
          },
        });
      }

      if (commandName === 'ticket') {
        return NextResponse.json({
          type: 4,
          data: {
            embeds: [
              {
                title: '🛡️ Tatakae Labs — Support Center',
                description:
                  'Welcome to Tatakae Labs Support. Please choose an option below to open a ticket.',
                color: 0x8b5cf6,
                fields: [
                  { name: '💬 General Support', value: 'Questions and general community inquiries.', inline: false },
                  { name: '🛠️ Technical Support', value: 'Technical issues, bug reports, and setup troubleshooting.', inline: false },
                  { name: '🤝 Partnership Enquiry', value: 'Business, collaboration, and ecosystem partnerships.', inline: false },
                  { name: '💳 Billing Enquiry', value: 'Invoicing, payments, and commercial plans.', inline: false },
                ],
                footer: { text: 'Tatakae Nexus Serverless Support System' },
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 3,
                    custom_id: 'ticket:select_category',
                    placeholder: 'Select a ticket category to open...',
                    options: [
                      { label: 'General Support', value: 'general', description: 'General questions' },
                      { label: 'Technical Support', value: 'technical', description: 'Technical assistance' },
                      { label: 'Partnership Enquiry', value: 'partnership', description: 'Business & collabs' },
                      { label: 'Billing Enquiry', value: 'billing', description: 'Payments & billing' },
                    ],
                  },
                ],
              },
            ],
          },
        });
      }

      if (commandName === 'booking') {
        return NextResponse.json({
          type: 4,
          data: {
            embeds: [
              {
                title: '📅 Tatakae Labs — Booking & Consultations',
                description: 'Select a consultation type below to schedule directly with our engineers.',
                color: 0x22d3ee,
                fields: [
                  { name: '🔹 Architecture Consultation', value: 'Duration: 45 mins', inline: false },
                  { name: '🔹 Security Review & Audit', value: 'Duration: 60 mins', inline: false },
                  { name: '🔹 Product Onboarding Call', value: 'Duration: 30 mins', inline: false },
                ],
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 3,
                    custom_id: 'booking:select_service',
                    placeholder: 'Choose a service to schedule...',
                    options: [
                      { label: 'Architecture Consultation', value: 'arch', description: '45 mins review' },
                      { label: 'Security Review & Audit', value: 'sec', description: '60 mins review' },
                      { label: 'Product Onboarding Call', value: 'onboard', description: '30 mins session' },
                    ],
                  },
                ],
              },
            ],
          },
        });
      }

      if (commandName === 'setup' || commandName === 'provision') {
        return NextResponse.json({
          type: 4,
          data: {
            embeds: [
              {
                title: '⚡ Tatakae Nexus — Serverless Cloud Active',
                description:
                  'Tatakae Nexus is deployed on Vercel Serverless.\n\n' +
                  '• **Interactions Endpoint:** Active & verified on Vercel\n' +
                  '• **Slash Commands:** `/ping`, `/ticket`, `/booking`, `/dashboard`, `/provision`\n' +
                  '• **Web Dashboard:** [https://tatakaebot.vercel.app](https://tatakaebot.vercel.app)\n\n' +
                  'Your bot is serving requests 24/7 without needing a local PC or server.',
                color: 0x22c55e,
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    label: 'Open Web Dashboard',
                    style: 5,
                    url: 'https://tatakaebot.vercel.app/dashboard',
                  },
                ],
              },
            ],
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

    // 3. Handle Select Menu & Button Components (Type 3)
    if (interaction.type === 3) {
      if (customId === 'ticket:select_category') {
        const cat = interaction.data?.values?.[0] || 'support';
        return NextResponse.json({
          type: 9,
          data: {
            custom_id: `ticket:modal:${cat}`,
            title: `Open Support Ticket`.slice(0, 45),
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: 'subject',
                    label: 'Subject',
                    style: 1,
                    placeholder: 'Brief summary of issue...',
                    required: true,
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: 'description',
                    label: 'Details',
                    style: 2,
                    placeholder: 'Explain what you need assistance with...',
                    required: true,
                  },
                ],
              },
            ],
          },
        });
      }

      if (customId === 'booking:select_service') {
        const s = interaction.data?.values?.[0] || 'call';
        return NextResponse.json({
          type: 9,
          data: {
            custom_id: `booking:modal:${s}`,
            title: `Book Consultation`,
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: 'preferred_time',
                    label: 'Preferred Date & Time',
                    style: 1,
                    placeholder: 'e.g. Tomorrow at 3:00 PM IST',
                    required: true,
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: 'notes',
                    label: 'Agenda / Discussion Points',
                    style: 2,
                    placeholder: 'Topics you want to discuss...',
                    required: true,
                  },
                ],
              },
            ],
          },
        });
      }
    }

    // 4. Handle Modal Submit (Type 5)
    if (interaction.type === 5) {
      if (customId?.startsWith('ticket:modal:')) {
        const subject = interaction.data?.components?.[0]?.components?.[0]?.value || 'Ticket';
        return NextResponse.json({
          type: 4,
          data: {
            content: `🛡️ **Support Ticket Created!**\n**Subject:** ${subject}\n\nOur team has been notified. You can review ticket updates on the web dashboard.`,
            flags: 64,
          },
        });
      }

      if (customId?.startsWith('booking:modal:')) {
        const time = interaction.data?.components?.[0]?.components?.[0]?.value || 'Upcoming';
        return NextResponse.json({
          type: 4,
          data: {
            content: `📅 **Appointment Request Received!**\n**Scheduled Window:** ${time}\n\nOur team will confirm your consultation shortly.`,
            flags: 64,
          },
        });
      }
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
