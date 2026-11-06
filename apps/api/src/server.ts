import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from '@tatakae/config';
import { logger } from '@tatakae/logger';
import { connectDatabase, seedDatabase } from '@tatakae/database';
import { ticketRoutes } from './routes/tickets.routes.js';
import { bookingRoutes } from './routes/bookings.routes.js';
import { moderationRoutes } from './routes/moderation.routes.js';
import { overviewRoutes } from './routes/overview.routes.js';
import { auditRoutes } from './routes/audit.routes.js';

const app = Fastify({
  logger: false,
});

async function start() {
  try {
    await connectDatabase();
    await seedDatabase();
  } catch (dbErr) {
    logger.warn({ err: dbErr }, '⚠️ MongoDB not reachable at start, continuing server startup...');
  }

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });

  // OpenAPI Swagger Documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Tatakae Nexus API',
        description: 'Centralized Discord Management Platform API for Tatakae Labs',
        version: '1.0.0',
      },
      servers: [{ url: `http://localhost:${env.API_PORT}` }],
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Healthcheck
  app.get('/health', async () => {
    return { status: 'healthy', database: 'mongodb', timestamp: new Date().toISOString() };
  });

  // Modular Routes
  await app.register(overviewRoutes, { prefix: '/api' });
  await app.register(ticketRoutes, { prefix: '/api' });
  await app.register(bookingRoutes, { prefix: '/api' });
  await app.register(moderationRoutes, { prefix: '/api' });
  await app.register(auditRoutes, { prefix: '/api' });

  // Centralized Error Handling
  app.setErrorHandler((error, request, reply) => {
    logger.error({ err: error, url: request.url }, 'API Request Error');
    const err = error as any;
    const statusCode = err.statusCode || 500;
    return reply.status(statusCode).send({
      success: false,
      error: {
        code: err.code || 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred.',
      },
    });
  });

  try {
    await app.listen({ port: env.API_PORT, host: '0.0.0.0' });
    logger.info(`🚀 Tatakae Nexus API running at http://localhost:${env.API_PORT}`);
    logger.info(`📖 OpenAPI documentation available at http://localhost:${env.API_PORT}/docs`);
  } catch (err) {
    logger.fatal({ err }, 'Failed to start API server');
    process.exit(1);
  }
}

start();
