import { FastifyInstance } from 'fastify';
import {
  bookingService,
  bookingRepository,
  createBookingSchema,
  updateBookingStatusSchema,
} from '@tatakae/core';
import { BookingStatus } from '@tatakae/shared';
import { BookingServiceModel } from '@tatakae/database';

export async function bookingRoutes(fastify: FastifyInstance) {
  // List Bookings
  fastify.get('/guilds/:guildId/bookings', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const { status, serviceId } = request.query as {
      status?: BookingStatus;
      serviceId?: string;
    };
    const bookings = await bookingRepository.list(guildId, { status, serviceId });
    return reply.send({ success: true, data: bookings });
  });

  // List Services
  fastify.get('/guilds/:guildId/booking-services', async (request, reply) => {
    const { guildId } = request.params as { guildId: string };
    const services = await BookingServiceModel.find({ guildId, active: true }).lean();
    return reply.send({ success: true, data: services });
  });

  // Get Available Slots
  fastify.get('/booking-services/:serviceId/slots', async (request, reply) => {
    const { serviceId } = request.params as { serviceId: string };
    const { date } = request.query as { date: string };
    const targetDate = date ? new Date(date) : new Date();
    const slots = await bookingService.getAvailableSlots(serviceId, targetDate);
    return reply.send({ success: true, data: slots });
  });

  // Create Booking
  fastify.post('/bookings', async (request, reply) => {
    const parsed = createBookingSchema.parse(request.body);
    const booking = await bookingService.createBooking(parsed);
    return reply.status(201).send({ success: true, data: booking });
  });

  // Update Status (Confirm / Cancel)
  fastify.patch('/bookings/:bookingId/status', async (request, reply) => {
    const { bookingId } = request.params as { bookingId: string };
    const parsed = updateBookingStatusSchema.parse(request.body);
    const updated = await bookingService.updateStatus(
      bookingId,
      parsed.status,
      parsed.actorId,
      parsed.notes
    );
    return reply.send({ success: true, data: updated });
  });
}
