import { REST, Routes } from 'discord.js';
import { env } from '@tatakae/config';
import { logger } from '@tatakae/logger';
import { ticketCommand } from './commands/ticket.command.js';
import { bookingCommand } from './commands/booking.command.js';
import { moderationCommand } from './commands/moderation.command.js';
import { setupCommand, dashboardCommand } from './commands/setup.command.js';
import { provisionCommand } from './commands/provision.command.js';

const commands = [
  ticketCommand.data.toJSON(),
  bookingCommand.data.toJSON(),
  moderationCommand.data.toJSON(),
  setupCommand.data.toJSON(),
  dashboardCommand.data.toJSON(),
  provisionCommand.data.toJSON(),
];

const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);

export async function deployCommands() {
  try {
    logger.info(`Deploying ${commands.length} application (/) commands to Discord...`);

    if (env.DISCORD_GUILD_ID && env.DISCORD_GUILD_ID !== 'placeholder_guild_id') {
      // Guild command registration for rapid development
      await rest.put(
        Routes.applicationGuildCommands(env.DISCORD_CLIENT_ID, env.DISCORD_GUILD_ID),
        { body: commands }
      );
      logger.info(`Successfully registered commands to guild ${env.DISCORD_GUILD_ID}`);
    } else {
      // Global command registration
      await rest.put(
        Routes.applicationCommands(env.DISCORD_CLIENT_ID),
        { body: commands }
      );
      logger.info('Successfully registered global application commands');
    }
  } catch (error) {
    logger.error({ err: error }, 'Failed to register Discord commands');
  }
}

if (process.argv[1]?.endsWith('deploy-commands.js') || process.argv[1]?.endsWith('deploy-commands.ts')) {
  deployCommands();
}

