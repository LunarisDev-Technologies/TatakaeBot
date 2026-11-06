import { FastifyInstance } from 'fastify';
import { auditService } from '@tatakae/core';

export async function auditRoutes(fastify: FastifyInstance) {
  fastify.get('/guilds/:guildId/audit-logs', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const { limit = '50', offset = '0' } = request.query as { limit?: string; offset?: string };
    const logs = await auditService.getLogs(guildId, parseInt(limit, 10), parseInt(offset, 10));
    return reply.send({ success: true, data: logs });
  });
}

