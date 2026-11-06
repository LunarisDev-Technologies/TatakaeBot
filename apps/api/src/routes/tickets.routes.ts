import { FastifyInstance } from 'fastify';
import {
  ticketService,
  ticketRepository,
  createTicketSchema,
  updateTicketStatusSchema,
  updateTicketPrioritySchema,
  assignTicketSchema,
} from '@tatakae/core';
import { TicketStatus } from '@tatakae/shared';
import { TicketCategoryModel } from '@tatakae/database';

export async function ticketRoutes(fastify: FastifyInstance) {
  // List Tickets
  fastify.get('/guilds/:guildId/tickets', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const { status, categoryId } = request.query as { status?: TicketStatus; categoryId?: string };
    const tickets = await ticketRepository.list(guildId, { status, categoryId });
    return reply.send({ success: true, data: tickets });
  });

  // Get Ticket Categories
  fastify.get('/guilds/:guildId/ticket-categories', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const categories = await TicketCategoryModel.find({ guildId, active: true }).lean();
    return reply.send({ success: true, data: categories });
  });

  // Get Ticket by ID
  fastify.get('/tickets/:ticketId', async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket) {
      return reply.status(404).send({ success: false, error: { message: 'Ticket not found' } });
    }
    return reply.send({ success: true, data: ticket });
  });

  // Create Ticket
  fastify.post('/tickets', async (request, reply) => {
    const parsed = createTicketSchema.parse(request.body);
    const ticket = await ticketService.createTicket(parsed);
    return reply.status(201).send({ success: true, data: ticket });
  });

  // Claim Ticket
  fastify.post('/tickets/:ticketId/claim', async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const { staffDiscordId } = request.body as { staffDiscordId: string };
    const updated = await ticketService.claimTicket(ticketId, staffDiscordId);
    return reply.send({ success: true, data: updated });
  });

  // Assign Ticket
  fastify.post('/tickets/:ticketId/assign', async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const parsed = assignTicketSchema.parse(request.body);
    const updated = await ticketService.assignStaff(ticketId, parsed.staffDiscordId, parsed.actorId);
    return reply.send({ success: true, data: updated });
  });

  // Update Status / Close
  fastify.patch('/tickets/:ticketId/status', async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const parsed = updateTicketStatusSchema.parse(request.body);
    const updated = await ticketService.updateStatus(ticketId, parsed.status, parsed.actorId, parsed.reason);
    return reply.send({ success: true, data: updated });
  });

  // Update Priority
  fastify.patch('/tickets/:ticketId/priority', async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const parsed = updateTicketPrioritySchema.parse(request.body);
    const updated = await ticketService.updatePriority(ticketId, parsed.priority, parsed.actorId);
    return reply.send({ success: true, data: updated });
  });

  // Export Transcript
  fastify.get('/tickets/:ticketId/transcript', async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const html = await ticketService.generateTranscript(ticketId);
    return reply.header('Content-Type', 'text/html').send(html);
  });
}
