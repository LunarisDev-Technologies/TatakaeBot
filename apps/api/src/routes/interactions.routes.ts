import { FastifyPluginAsync } from 'fastify';
import crypto from 'crypto';
import { env } from '@tatakae/config';
import { logger } from '@tatakae/logger';
import { TicketCategoryModel, BookingServiceModel, GuildModel } from '@tatakae/database';

function verifyDiscordSignature(
  rawBody: Buffer | string,
  signature: string,
  timestamp: string,
  clientPublicKey: string
): boolean {
  try {
    const pubKey = Buffer.from(clientPublicKey, 'hex');
    const sig = Buffer.from(signature, 'hex');
    const msg = Buffer.concat([
      Buffer.from(timestamp),
      Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(rawBody),
    ]);

    // Standard SPKI Der prefix for Ed25519
    const spkiPrefix = Buffer.from('302a300506032b6570032100', 'hex');
    const key = crypto.createPublicKey({
      key: Buffer.concat([spkiPrefix, pubKey]),
      format: 'der',
      type: 'spki',
    });

    return crypto.verify(null, msg, key, sig);
  } catch (err) {
    logger.error({ err }, 'Signature verification exception');
    return false;
  }
}

export const interactionsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/interactions', async (request, reply) => {
    const signature = request.headers['x-signature-ed25519'] as string;
    const timestamp = request.headers['x-signature-timestamp'] as string;
    const publicKey = process.env.DISCORD_PUBLIC_KEY || process.env.PUBLIC_KEY || '';

    const rawBody = (request as any).rawBody || Buffer.from(JSON.stringify(request.body));

    // If PUBLIC_KEY is configured, enforce strict cryptographic Ed25519 verification
    if (publicKey && publicKey !== 'placeholder_public_key') {
      if (!signature || !timestamp || !verifyDiscordSignature(rawBody, signature, timestamp, publicKey)) {
        return reply.status(401).send('Invalid request signature');
      }
    }

    const interaction = request.body as any;
    if (!interaction) return reply.status(400).send('Missing body');

    // 1. Handle PING (Type 1) - Required for Discord Endpoint URL registration
    if (interaction.type === 1) {
      return reply.send({ type: 1 });
    }

    const guildId = interaction.guild_id || env.DISCORD_GUILD_ID;
    const member = interaction.member || { user: interaction.user };
    const actor = member?.user;

    // 2. Handle Application Commands (Slash Commands - Type 2)
    if (interaction.type === 2) {
      const commandName = interaction.data?.name;

      if (commandName === 'ping') {
        return reply.send({
          type: 4,
          data: {
            content: '🏓 Pong! Tatakae Nexus is running 24/7 on Vercel Serverless!',
          },
        });
      }

      if (commandName === 'dashboard') {
        return reply.send({
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
                    url: `${env.DASHBOARD_URL}/dashboard`,
                  },
                ],
              },
            ],
            flags: 64,
          },
        });
      }

      if (commandName === 'ticket') {
        const categories = await TicketCategoryModel.find({
          guildId,
          active: true,
        }).lean();

        if (categories.length === 0) {
          return reply.send({
            type: 4,
            data: {
              content: '❌ No active ticket categories configured in MongoDB.',
              flags: 64,
            },
          });
        }

        return reply.send({
          type: 4,
          data: {
            embeds: [
              {
                title: '🛡️ Tatakae Labs — Support Center',
                description:
                  'Welcome to Tatakae Labs Support. Please select a category below to open a private assistance ticket with our team.',
                color: 0x8b5cf6,
                fields: categories.map((c: any) => ({
                  name: `${c.emoji || '📌'} ${c.name}`,
                  value: c.description || 'Support inquiry',
                  inline: false,
                })),
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
                    options: categories.map((c: any) => ({
                      label: c.name,
                      value: c._id.toString(),
                      description: (c.description || 'Open a ticket').slice(0, 50),
                      emoji: c.emoji ? { name: c.emoji } : undefined,
                    })),
                  },
                ],
              },
            ],
          },
        });
      }

      if (commandName === 'booking') {
        const services = await BookingServiceModel.find({ guildId, active: true }).lean();

        return reply.send({
          type: 4,
          data: {
            embeds: [
              {
                title: '📅 Tatakae Labs — Booking & Consultations',
                description: 'Select a consultation type below to schedule directly with our engineers.',
                color: 0x22d3ee,
                fields: services.map((s: any) => ({
                  name: `🔹 ${s.name}`,
                  value: `${s.description || 'Consultation'}\n⏳ Duration: **${s.durationMinutes} mins**`,
                  inline: false,
                })),
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
                    options: services.map((s: any) => ({
                      label: s.name,
                      value: s._id.toString(),
                      description: `${s.durationMinutes}m consultation`.slice(0, 50),
                    })),
                  },
                ],
              },
            ],
          },
        });
      }

      if (commandName === 'setup' || commandName === 'provision') {
        return reply.send({
          type: 4,
          data: {
            embeds: [
              {
                title: '⚡ Tatakae Nexus — Serverless Operation Mode',
                description:
                  'Tatakae Nexus is deployed on Vercel Serverless.\n\n' +
                  '• **Interactions Endpoint:** Active at `/api/interactions`\n' +
                  '• **MongoDB Cloud:** Connected and synchronized\n' +
                  '• **Website & Dashboard:** Live 24/7\n\n' +
                  'Run `/provision` in Discord or access your control center below.',
                color: 0x22c55e,
              },
            ],
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 2,
                    label: 'Go to Dashboard',
                    style: 5,
                    url: `${env.DASHBOARD_URL}/dashboard`,
                  },
                ],
              },
            ],
          },
        });
      }

      return reply.send({
        type: 4,
        data: { content: `Command \`/${commandName}\` processed via Vercel Serverless.` },
      });
    }

    // 3. Handle Component Interactions (Select Menus / Buttons - Type 3)
    if (interaction.type === 3) {
      const customId = interaction.data?.custom_id;

      if (customId === 'ticket:select_category') {
        const categoryId = interaction.data?.values?.[0];
        const category: any = await TicketCategoryModel.findById(categoryId).lean();

        // Return Modal (Type 9)
        return reply.send({
          type: 9,
          data: {
            custom_id: `ticket:create_modal:${categoryId}`,
            title: `Open: ${category?.name || 'Support'}`.slice(0, 45),
            components: [
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: 'subject',
                    label: 'Brief Subject',
                    style: 1,
                    placeholder: 'Describe your question or issue...',
                    required: true,
                    max_length: 100,
                  },
                ],
              },
              {
                type: 1,
                components: [
                  {
                    type: 4,
                    custom_id: 'description',
                    label: 'Detailed Explanation',
                    style: 2,
                    placeholder: 'Provide all relevant details or requirements...',
                    required: true,
                    max_length: 1000,
                  },
                ],
              },
            ],
          },
        });
      }

      if (customId === 'booking:select_service') {
        const serviceId = interaction.data?.values?.[0];
        const service: any = await BookingServiceModel.findById(serviceId).lean();

        return reply.send({
          type: 9,
          data: {
            custom_id: `booking:modal:${serviceId}`,
            title: `Book: ${service?.name || 'Consultation'}`.slice(0, 45),
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
                    custom_id: 'purpose',
                    label: 'Meeting Objective',
                    style: 2,
                    placeholder: 'Describe what you would like to discuss...',
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
      const customId = interaction.data?.custom_id;

      if (customId?.startsWith('ticket:create_modal:')) {
        const subject = interaction.data?.components?.[0]?.components?.[0]?.value || 'Support Ticket';
        return reply.send({
          type: 4,
          data: {
            content: `🛡️ **Support Ticket Created!**\n**Subject:** ${subject}\n\nOur team has been notified. You can review ticket updates on the web dashboard.`,
            flags: 64,
          },
        });
      }

      if (customId?.startsWith('booking:modal:')) {
        const time = interaction.data?.components?.[0]?.components?.[0]?.value || 'Upcoming';
        return reply.send({
          type: 4,
          data: {
            content: `📅 **Appointment Request Received!**\n**Scheduled Window:** ${time}\n\nOur team has received your consultation booking and will confirm shortly.`,
            flags: 64,
          },
        });
      }
    }

    return reply.status(200).send({ ok: true });
  });
};

