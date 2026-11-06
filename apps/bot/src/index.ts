import { client } from './client.js';
import { ActivityType } from 'discord.js';
import { env } from '@tatakae/config';
import { logger } from '@tatakae/logger';
import { connectDatabase, GuildModel } from '@tatakae/database';
import { ticketCommand } from './commands/ticket.command.js';
import { bookingCommand } from './commands/booking.command.js';
import { moderationCommand } from './commands/moderation.command.js';
import { setupCommand, dashboardCommand } from './commands/setup.command.js';
import {
  handleCategorySelect,
  handleTicketModalSubmit,
  handleTicketButtons,
} from './interactions/ticket-handlers.js';
import {
  handleBookingServiceSelect,
  handleBookingModalSubmit,
} from './interactions/booking-handlers.js';
import { ticketRepository, ticketService } from '@tatakae/core';
import { deployCommands } from './deploy-commands.js';

const commandMap = new Map<string, any>([
  ['ticket', ticketCommand],
  ['booking', bookingCommand],
  ['mod', moderationCommand],
  ['setup', setupCommand],
  ['dashboard', dashboardCommand],
]);

client.on('ready', async () => {
  logger.info(`🤖 Discord Bot connected as ${client.user?.tag}!`);

  client.user?.setPresence({
    activities: [
      {
        name: 'www.tatakaelas.tech',
        type: ActivityType.Streaming,
        url: 'https://www.twitch.tv/tatakaelabs',
      },
    ],
    status: 'online',
  });

  try {
    await connectDatabase();
    // Sync the real guild from Discord into MongoDB
    const targetGuildId = env.DISCORD_GUILD_ID;
    if (targetGuildId && targetGuildId !== 'placeholder_guild_id') {
      const guild = await client.guilds.fetch(targetGuildId).catch(() => null);
      if (guild) {
        await GuildModel.findByIdAndUpdate(
          guild.id,
          {
            _id: guild.id,
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL() || '',
            ownerId: guild.ownerId,
            memberCount: guild.memberCount,
            active: true,
          },
          { upsert: true, new: true }
        );
        logger.info(`✅ Synced real Guild "${guild.name}" (${guild.memberCount} members) to MongoDB.`);
      }
    }
  } catch (err) {
    logger.warn({ err }, 'Could not sync guild to MongoDB at startup.');
  }

  await deployCommands();
});

client.on('interactionCreate', async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      const handler = commandMap.get(interaction.commandName);
      if (handler) {
        await handler.execute(interaction);
      }
      return;
    }

    if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'ticket:select_category') {
        return handleCategorySelect(interaction);
      }
      if (interaction.customId === 'booking:select_service') {
        return handleBookingServiceSelect(interaction);
      }
      return;
    }

    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('ticket:create_modal:')) {
        return handleTicketModalSubmit(interaction);
      }
      if (interaction.customId.startsWith('booking:create_modal:')) {
        return handleBookingModalSubmit(interaction);
      }
      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId.startsWith('ticket:')) {
        return handleTicketButtons(interaction);
      }
      return;
    }
  } catch (error) {
    logger.error({ err: error }, 'Unhandled interaction error');
    if (interaction.isRepliable()) {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply('❌ An error occurred processing this interaction.').catch(() => {});
      } else {
        await interaction.reply({ content: '❌ An error occurred.', ephemeral: true }).catch(() => {});
      }
    }
  }
});

// Record ticket channel messages to MongoDB
client.on('messageCreate', async (message) => {
  if (message.author.bot || !message.guild) return;

  const ticket = await ticketRepository.findByChannelId(message.channelId);
  if (ticket) {
    await ticketService.recordMessage((ticket as any)._id.toString(), {
      discordMessageId: message.id,
      authorId: message.author.id,
      authorName: message.author.tag,
      authorAvatar: message.author.avatarURL(),
      content: message.content,
      attachments: Array.from(message.attachments.values()).map((a) => ({
        url: a.url,
        name: a.name,
        contentType: a.contentType,
      })),
    });
  }
});

if (env.DISCORD_TOKEN && env.DISCORD_TOKEN !== 'placeholder_bot_token') {
  client.login(env.DISCORD_TOKEN).catch((err) => {
    logger.error({ err }, 'Failed to login to Discord');
  });
} else {
  logger.warn('⚠️ DISCORD_TOKEN is not configured.');
}

process.on('SIGTERM', () => {
  logger.info('Shutting down bot client...');
  client.destroy();
  process.exit(0);
});
