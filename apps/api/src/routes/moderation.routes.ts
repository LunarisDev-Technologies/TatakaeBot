import { FastifyInstance } from 'fastify';
import { moderationService, moderationActionSchema } from '@tatakae/core';

export async function moderationRoutes(fastify: FastifyInstance) {
  // Get Recent Cases
  fastify.get('/guilds/:guildId/moderation/cases', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const cases = await moderationService.getRecentCases(guildId);
    return reply.send({ success: true, data: cases });
  });

  // Get User History
  fastify.get('/guilds/:guildId/moderation/users/:userId/history', async (request, reply) => {
    const { guildId, userId } = request.params as { guildId: string; userId: string };
    const history = await moderationService.getHistory(guildId, userId);
    return reply.send({ success: true, data: history });
  });

  // Record Moderation Action
  fastify.post('/guilds/:guildId/moderation/cases', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const parsed = moderationActionSchema.parse({ ...(request.body as object), guildId });
    const modCase = await moderationService.recordCase(parsed);
    return reply.status(201).send({ success: true, data: modCase });
  });
}

