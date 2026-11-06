import { Client, GatewayIntentBits, ActivityType } from 'discord.js';
import { env } from '@tatakae/config';
import { logger } from '@tatakae/logger';

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.once('ready', () => {
  logger.info(`✅ [Online Sync] Tatakae Nexus Bot is now ONLINE as ${client.user?.tag}`);
  logger.info('📺 Presence set to Streaming: www.tatakaelas.tech');

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
});

client.on('error', (err) => {
  logger.error({ err }, 'Online Sync Gateway Error');
});

if (env.DISCORD_TOKEN && env.DISCORD_TOKEN !== 'placeholder_bot_token') {
  client.login(env.DISCORD_TOKEN).catch((err) => {
    logger.error({ err }, 'Failed to login via Online Sync');
  });
} else {
  logger.warn('DISCORD_TOKEN not configured.');
}
