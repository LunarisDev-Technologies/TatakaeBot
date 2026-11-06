import { TicketModel } from '@tatakae/database';
import { TicketStatus } from '@tatakae/shared';

export class TicketRepository {
  async getNextTicketNumber(guildId: string): Promise<number> {
    const lastTicket: any = await TicketModel.findOne({ guildId })
      .sort({ ticketNumber: -1 })
      .select('ticketNumber')
      .lean();
    return (lastTicket?.ticketNumber || 0) + 1;
  }

  async findById(ticketId: string) {
    return TicketModel.findById(ticketId).lean();
  }

  async findByChannelId(channelId: string) {
    return TicketModel.findOne({ channelId }).lean();
  }

  async list(guildId: string, filter?: { status?: TicketStatus; categoryId?: string; search?: string }) {
    const query: any = { guildId };
    if (filter?.status) query.status = filter.status;
    if (filter?.categoryId) query.categoryId = filter.categoryId;

    return TicketModel.find(query).sort({ createdAt: -1 }).lean();
  }

  async countOpen(guildId: string): Promise<number> {
    return TicketModel.countDocuments({
      guildId,
      status: { $nin: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
    });
  }

  async countUnassigned(guildId: string): Promise<number> {
    return TicketModel.countDocuments({
      guildId,
      status: { $nin: [TicketStatus.CLOSED, TicketStatus.RESOLVED] },
      $or: [{ staffDiscordId: { $exists: false } }, { staffDiscordId: null }, { staffDiscordId: '' }],
    });
  }
}

export const ticketRepository = new TicketRepository();
