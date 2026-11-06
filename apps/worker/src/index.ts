import { connectDatabase } from '@tatakae/database';
import { logger } from '@tatakae/logger';
import { processBookingReminders } from './processors/reminders.processor.js';
import { processInactiveTickets } from './processors/tickets.processor.js';

async function start() {
  logger.info('⚙️ Starting Tatakae Nexus Background Automation Worker...');

  try {
    await connectDatabase();
  } catch (err) {
    logger.warn({ err }, 'Could not connect to MongoDB in worker immediately.');
  }

  // Periodic recurring task scheduler (1 minute heartbeat)
  const interval = setInterval(async () => {
    try {
      await processBookingReminders();
      await processInactiveTickets();
    } catch (err) {
      logger.error({ err }, 'Error during background scheduled tick');
    }
  }, 60 * 1000);

  processBookingReminders().catch(() => {});
  processInactiveTickets().catch(() => {});

  const shutdown = () => {
    logger.info('Stopping worker process...');
    clearInterval(interval);
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
