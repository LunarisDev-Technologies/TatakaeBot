import { FastifyInstance } from 'fastify';
import { GuildModel } from '@tatakae/database';
import { ticketRepository, bookingRepository, moderationService, auditService } from '@tatakae/core';

export async function overviewRoutes(fastify: FastifyInstance) {
  fastify.get('/guilds/:guildId/overview', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };

    const [openTickets, unassignedTickets, pendingBookings, modCases, guild, recentAuditLogs] =
      await Promise.all([
        ticketRepository.countOpen(guildId),
        ticketRepository.countUnassigned(guildId),
        bookingRepository.countPending(guildId),
        moderationService.countCases(guildId),
        GuildModel.findById(guildId).lean(),
        auditService.getLogs(guildId, 8),
      ]);

    return reply.send({
      success: true,
      data: {
        guild: guild || { id: guildId, name: 'Tatakae Labs', memberCount: 1 },
        stats: {
          totalMembers: (guild as any)?.memberCount || 1,
          openTickets,
          unassignedTickets,
          pendingBookings,
          moderationCases: modCases,
        },
        recentActivity: recentAuditLogs,
      },
    });
  });

  fastify.get('/guilds/:guildId/settings', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const guild = await GuildModel.findById(guildId).lean();
    return reply.send({ success: true, data: guild });
  });

  fastify.post('/guilds/:guildId/settings', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const body = request.body as Record<string, any>;
    const updated = await GuildModel.findByIdAndUpdate(
      guildId,
      { $set: body },
      { upsert: true, new: true }
    ).lean();
    return reply.send({ success: true, data: updated });
  });
}
