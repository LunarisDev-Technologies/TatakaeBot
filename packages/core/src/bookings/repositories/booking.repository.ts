import { BookingModel, BookingServiceModel } from '@tatakae/database';
import { BookingStatus } from '@tatakae/shared';

export class BookingRepository {
  async findById(bookingId: string) {
    return BookingModel.findById(bookingId).lean();
  }

  async list(guildId: string, filter?: { status?: BookingStatus; serviceId?: string }) {
    const query: any = { guildId };
    if (filter?.status) query.status = filter.status;
    if (filter?.serviceId) query.serviceId = filter.serviceId;

    return BookingModel.find(query).sort({ startAt: 1 }).lean();
  }

  async findOverlapping(guildId: string, startAt: Date, endAt: Date) {
    return BookingModel.findOne({
      guildId,
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      $or: [
        { startAt: { $lte: startAt }, endAt: { $gt: startAt } },
        { startAt: { $lt: endAt }, endAt: { $gte: endAt } },
        { startAt: { $gte: startAt }, endAt: { $lte: endAt } },
      ],
    }).lean();
  }

  async countPending(guildId: string): Promise<number> {
    return BookingModel.countDocuments({
      guildId,
      status: BookingStatus.PENDING,
    });
  }
}

export const bookingRepository = new BookingRepository();
