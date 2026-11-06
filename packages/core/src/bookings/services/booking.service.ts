import { BookingModel, BookingServiceModel } from '@tatakae/database';
import { logger } from '@tatakae/logger';
import { AuditEntityType, BookingStatus } from '@tatakae/shared';
import { auditService } from '../../audit/audit.service.js';
import { bookingRepository } from '../repositories/booking.repository.js';
import { z } from 'zod';
import { createBookingSchema } from '../schemas/booking.schemas.js';

export class BookingService {
  async getAvailableSlots(serviceId: string, date: Date) {
    const service: any = await BookingServiceModel.findById(serviceId).lean();
    if (!service) throw new Error('Service not found.');

    const slots: { startAt: Date; endAt: Date }[] = [];

    // Working hours: 09:00 to 18:00
    let currentSlotStart = new Date(date);
    currentSlotStart.setHours(9, 0, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(18, 0, 0, 0);

    while (currentSlotStart.getTime() + service.durationMinutes * 60000 <= dayEnd.getTime()) {
      const currentSlotEnd = new Date(currentSlotStart.getTime() + service.durationMinutes * 60000);

      const overlapping = await bookingRepository.findOverlapping(
        service.guildId,
        currentSlotStart,
        currentSlotEnd
      );

      if (!overlapping) {
        slots.push({
          startAt: new Date(currentSlotStart),
          endAt: new Date(currentSlotEnd),
        });
      }

      currentSlotStart = new Date(currentSlotEnd.getTime() + service.bufferMinutes * 60000);
    }

    return slots;
  }

  async createBooking(input: z.infer<typeof createBookingSchema>) {
    let service: any = await BookingServiceModel.findById(input.serviceId).lean();
    if (!service) {
      service = await BookingServiceModel.findOne({ guildId: input.guildId }).lean();
    }
    const serviceName = service?.name || 'Consultation & Demo';
    const durationMinutes = service?.durationMinutes || 30;

    const startAt = new Date(input.startAt);
    const endAt = new Date(startAt.getTime() + durationMinutes * 60000);

    // Double-booking check
    const conflict = await bookingRepository.findOverlapping(input.guildId, startAt, endAt);
    if (conflict) {
      throw new Error('This time slot is already reserved. Please select another slot.');
    }

    const booking = await BookingModel.create({
      guildId: input.guildId,
      serviceId: service?._id?.toString() || input.serviceId,
      serviceName,
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      discordId: input.discordId,
      purpose: input.purpose,
      startAt,
      endAt,
      status: BookingStatus.PENDING,
      notes: input.notes,
    });

    await auditService.record({
      guildId: input.guildId,
      actorId: input.discordId,
      action: 'BOOKING_CREATE',
      entityType: AuditEntityType.BOOKING,
      entityId: booking._id.toString(),
      metadata: { service: serviceName, startAt: startAt.toISOString() },
    });

    logger.info({ bookingId: booking._id }, 'Created appointment booking in MongoDB');
    return booking;
  }

  async updateStatus(bookingId: string, status: BookingStatus, actorId: string, notes?: string) {
    const booking = await BookingModel.findById(bookingId);
    if (!booking) throw new Error('Booking not found.');

    booking.status = status;
    if (notes) booking.notes = notes;
    await booking.save();

    await auditService.record({
      guildId: booking.guildId,
      actorId,
      action: `BOOKING_${status}`,
      entityType: AuditEntityType.BOOKING,
      entityId: booking.id,
      metadata: { newStatus: status, notes },
    });

    return booking.toJSON();
  }
}

export const bookingService = new BookingService();
