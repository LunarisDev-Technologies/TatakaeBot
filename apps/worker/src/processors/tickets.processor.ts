import { TicketCategoryModel, TicketModel } from '@tatakae/database';
import { ticketService } from '@tatakae/core';
import { logger } from '@tatakae/logger';
import { TicketStatus } from '@tatakae/shared';

export async function processInactiveTickets() {
  const categories: any[] = await TicketCategoryModel.find({ active: true }).lean();

  for (const cat of categories) {
    if (cat.autoCloseHours <= 0) continue;

    const cutoff = new Date(Date.now() - cat.autoCloseHours * 60 * 60 * 1000);

    const inactiveTickets = await TicketModel.find({
      categoryId: cat._id.toString(),
      status: { $in: [TicketStatus.OPEN, TicketStatus.WAITING, TicketStatus.RESOLVED] },
      updatedAt: { $lte: cutoff },
    }).limit(20);

    for (const ticket of inactiveTickets) {
      logger.info({ ticketId: ticket._id, ticketNumber: ticket.ticketNumber }, 'Auto-closing inactive ticket in MongoDB');
      await ticketService.updateStatus(
        ticket._id.toString(),
        TicketStatus.CLOSED,
        'SYSTEM_WORKER',
        `Auto-closed after ${cat.autoCloseHours} hours of inactivity`
      );
      await ticketService.generateTranscript(ticket._id.toString());
    }
  }
}
