import { BookingModel } from '@tatakae/database';
import { logger } from '@tatakae/logger';

export async function processBookingReminders() {
  const now = new Date();
  const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

  const upcomingBookings = await BookingModel.find({
    status: 'CONFIRMED',
    startAt: { $gte: now, $lte: nextHour },
  })
    .limit(20)
    .lean();

  if (upcomingBookings.length === 0) return;

  for (const b of upcomingBookings) {
    logger.info(
      { bookingId: b._id, client: b.clientName, service: b.serviceName },
      'Processing upcoming appointment notification'
    );
  }
}
