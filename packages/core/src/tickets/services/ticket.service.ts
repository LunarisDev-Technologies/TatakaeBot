import {
  TicketModel,
  TicketCategoryModel,
  TicketMessageModel,
  TicketTranscriptModel,
} from '@tatakae/database';
import { logger } from '@tatakae/logger';
import { AuditEntityType, TicketStatus, TicketPriority } from '@tatakae/shared';
import { auditService } from '../../audit/audit.service.js';
import { ticketRepository } from '../repositories/ticket.repository.js';
import { z } from 'zod';
import { createTicketSchema } from '../schemas/ticket.schemas.js';

export class TicketService {
  async createTicket(input: z.infer<typeof createTicketSchema>) {
    let category: any = await TicketCategoryModel.findById(input.categoryId).lean();
    if (!category) {
      category = await TicketCategoryModel.findOne({ guildId: input.guildId }).lean();
    }
    const categoryName = category?.name || 'General Support';

    const ticketNumber = await ticketRepository.getNextTicketNumber(input.guildId);

    const ticket = await TicketModel.create({
      guildId: input.guildId,
      ticketNumber,
      creatorDiscord: input.creatorDiscordId,
      creatorUsername: input.creatorUsername,
      creatorAvatar: input.creatorAvatar,
      categoryId: category?._id?.toString() || input.categoryId,
      categoryName,
      status: TicketStatus.OPEN,
      priority: TicketPriority.NORMAL,
      subject: input.subject || `${categoryName} #${ticketNumber}`,
      initialAnswers: input.initialAnswers || {},
    });

    await auditService.record({
      guildId: input.guildId,
      actorId: input.creatorDiscordId,
      action: 'TICKET_CREATE',
      entityType: AuditEntityType.TICKET,
      entityId: ticket._id.toString(),
      metadata: { ticketNumber, category: categoryName },
    });

    logger.info({ ticketId: ticket._id, ticketNumber }, 'Created new ticket in MongoDB');
    return ticket;
  }

  async linkDiscordChannel(ticketId: string, channelId: string) {
    return TicketModel.findByIdAndUpdate(ticketId, { channelId }, { new: true }).lean();
  }

  async claimTicket(ticketId: string, staffDiscordId: string) {
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found.');

    ticket.staffDiscordId = staffDiscordId;
    if (ticket.status === TicketStatus.OPEN) {
      ticket.status = TicketStatus.CLAIMED;
    }
    await ticket.save();

    await auditService.record({
      guildId: ticket.guildId,
      actorId: staffDiscordId,
      action: 'TICKET_CLAIM',
      entityType: AuditEntityType.TICKET,
      entityId: ticket.id,
      metadata: { staffDiscordId },
    });

    return ticket.toJSON();
  }

  async assignStaff(ticketId: string, staffDiscordId: string, actorId: string) {
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found.');

    ticket.staffDiscordId = staffDiscordId;
    await ticket.save();

    await auditService.record({
      guildId: ticket.guildId,
      actorId,
      action: 'TICKET_ASSIGN',
      entityType: AuditEntityType.TICKET,
      entityId: ticket.id,
      metadata: { assignedStaff: staffDiscordId },
    });

    return ticket.toJSON();
  }

  async updateStatus(ticketId: string, status: TicketStatus, actorId: string, reason?: string) {
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found.');

    const isClosing = status === TicketStatus.CLOSED;
    ticket.status = status;
    if (isClosing) {
      ticket.closedAt = new Date();
      ticket.closedById = actorId;
    }
    await ticket.save();

    await auditService.record({
      guildId: ticket.guildId,
      actorId,
      action: isClosing ? 'TICKET_CLOSE' : 'TICKET_STATUS_UPDATE',
      entityType: AuditEntityType.TICKET,
      entityId: ticket.id,
      metadata: { oldStatus: ticket.status, newStatus: status, reason },
    });

    return ticket.toJSON();
  }

  async updatePriority(ticketId: string, priority: TicketPriority, actorId: string) {
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket) throw new Error('Ticket not found.');

    const oldPriority = ticket.priority;
    ticket.priority = priority;
    await ticket.save();

    await auditService.record({
      guildId: ticket.guildId,
      actorId,
      action: 'TICKET_PRIORITY_UPDATE',
      entityType: AuditEntityType.TICKET,
      entityId: ticket.id,
      metadata: { oldPriority, newPriority: priority },
    });

    return ticket.toJSON();
  }

  async recordMessage(
    ticketId: string,
    data: {
      discordMessageId?: string;
      authorId: string;
      authorName: string;
      authorAvatar?: string | null;
      content: string;
      attachments?: unknown[];
    }
  ) {
    return TicketMessageModel.create({
      ticketId,
      discordMessageId: data.discordMessageId,
      authorId: data.authorId,
      authorName: data.authorName,
      authorAvatar: data.authorAvatar,
      content: data.content,
      attachments: data.attachments || [],
    });
  }

  async generateTranscript(ticketId: string): Promise<string> {
    const ticket: any = await TicketModel.findById(ticketId).lean();
    if (!ticket) throw new Error('Ticket not found.');

    const messages = await TicketMessageModel.find({ ticketId }).sort({ createdAt: 1 }).lean();

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ticket #${ticket.ticketNumber} Transcript — Tatakae Nexus</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    .header { border-bottom: 2px solid #1e293b; padding-bottom: 16px; margin-bottom: 24px; }
    .title { font-size: 24px; font-weight: bold; color: #38bdf8; }
    .meta { font-size: 14px; color: #94a3b8; margin-top: 8px; }
    .message { display: flex; gap: 12px; margin-bottom: 16px; padding: 8px 12px; border-radius: 8px; background: #1e293b; }
    .author { font-weight: 600; color: #f1f5f9; }
    .timestamp { font-size: 12px; color: #64748b; margin-left: 8px; }
    .content { margin-top: 4px; line-height: 1.5; color: #cbd5e1; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">Tatakae Nexus — Ticket #${ticket.ticketNumber} [${ticket.categoryName}]</div>
    <div class="meta">Subject: ${ticket.subject || 'N/A'} | Creator: ${ticket.creatorUsername} (${ticket.creatorDiscord}) | Closed: ${new Date().toISOString()}</div>
  </div>
  <div class="messages">
    ${messages
      .map(
        (m: any) => `
      <div class="message">
        <div>
          <div><span class="author">${m.authorName}</span><span class="timestamp">${new Date(m.createdAt).toISOString()}</span></div>
          <div class="content">${m.content}</div>
        </div>
      </div>`
      )
      .join('\n')}
  </div>
</body>
</html>
    `.trim();

    await TicketTranscriptModel.findOneAndUpdate(
      { ticketId },
      {
        ticketId,
        htmlContent: html,
        messageCount: messages.length,
        generatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return html;
  }
}

export const ticketService = new TicketService();
