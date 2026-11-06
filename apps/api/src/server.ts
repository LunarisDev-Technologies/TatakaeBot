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
import { interactionsRoutes } from './routes/interactions.routes.js';

const app = Fastify({
  logger: false,
});

// Preserve raw body Buffer for Discord Ed25519 webhook signature verification
app.addContentTypeParser(['application/json', 'text/plain'], { parseAs: 'buffer' }, (req, body: any, done) => {
  try {
    (req as any).rawBody = body;
    if (!body || body.length === 0) {
      done(null, {});
      return;
    }
    const json = JSON.parse(body.toString('utf-8'));
    done(null, json);
  } catch (err: any) {
    done(err, undefined);
  }
});

// Database connection plugin
app.register(async () => {
  try {
    await connectDatabase();
    await seedDatabase();
  } catch (dbErr) {
    logger.warn({ err: dbErr }, '⚠️ MongoDB not reachable at start, continuing server startup...');
  }
});

app.register(helmet, { contentSecurityPolicy: false });
app.register(cors, { origin: true, credentials: true });
app.register(rateLimit, { max: 200, timeWindow: '1 minute' });

// OpenAPI Swagger Documentation
app.register(swagger, {
  openapi: {
    info: {
      title: 'Tatakae Nexus API',
      description: 'Centralized Discord Management Platform API for Tatakae Labs',
      version: '1.0.0',
    },
    servers: [{ url: `http://localhost:${env.API_PORT}` }],
  },
});

app.register(swaggerUi, {
  routePrefix: '/docs',
});

// Healthcheck
app.get('/health', async () => {
  return { status: 'healthy', database: 'mongodb', timestamp: new Date().toISOString() };
});

// Modular Routes
app.register(overviewRoutes, { prefix: '/api' });
app.register(ticketRoutes, { prefix: '/api' });
app.register(bookingRoutes, { prefix: '/api' });
app.register(moderationRoutes, { prefix: '/api' });
app.register(auditRoutes, { prefix: '/api' });
app.register(interactionsRoutes, { prefix: '/api' });
app.register(interactionsRoutes);

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

const port = Number(process.env.PORT) || env.API_PORT;

if (!process.env.VERCEL) {
  app.listen({ port, host: '0.0.0.0' }).then(() => {
    logger.info(`🚀 Tatakae Nexus API running at http://localhost:${port}`);
    logger.info(`📖 OpenAPI documentation available at http://localhost:${port}/docs`);
  }).catch((err) => {
    logger.fatal({ err }, 'Failed to start API server');
    process.exit(1);
  });
}

export default app;
