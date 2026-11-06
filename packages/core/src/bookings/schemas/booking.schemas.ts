import { z } from 'zod';
import { BookingStatus } from '@tatakae/shared';

export const createBookingServiceSchema = z.object({
  guildId: z.string().min(1),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  durationMinutes: z.number().int().min(5).max(480).default(30),
  bufferMinutes: z.number().int().min(0).max(120).default(15),
  capacity: z.number().int().min(1).default(1),
  requiresApproval: z.boolean().default(false),
});

export const createBookingSchema = z.object({
  guildId: z.string().min(1),
  serviceId: z.string().uuid(),
  discordId: z.string().min(1),
  clientName: z.string().min(2).max(100),
  clientEmail: z.string().email(),
  purpose: z.string().min(2).max(500),
  staffId: z.string().uuid().optional(),
  startAt: z.coerce.date(),
  notes: z.string().max(1000).optional(),
  answers: z.record(z.string()).optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.nativeEnum(BookingStatus),
  actorId: z.string().min(1),
  notes: z.string().optional(),
});

export const setStaffAvailabilitySchema = z.object({
  staffId: z.string().uuid(),
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format must be HH:MM'),
});

