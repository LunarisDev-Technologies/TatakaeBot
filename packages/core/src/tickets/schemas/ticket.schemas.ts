import { z } from 'zod';
import { TicketPriority, TicketStatus } from '@tatakae/shared';

export const createTicketSchema = z.object({
  guildId: z.string().min(1),
  creatorDiscordId: z.string().min(1),
  creatorUsername: z.string().min(1),
  creatorAvatar: z.string().nullable().optional(),
  categoryId: z.string().uuid(),
  subject: z.string().max(200).optional(),
  initialAnswers: z.record(z.any()).default({}),
});

export const updateTicketStatusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
  actorId: z.string().min(1),
  reason: z.string().optional(),
});

export const updateTicketPrioritySchema = z.object({
  priority: z.nativeEnum(TicketPriority),
  actorId: z.string().min(1),
});

export const assignTicketSchema = z.object({
  staffDiscordId: z.string().min(1),
  actorId: z.string().min(1),
});

export const addParticipantSchema = z.object({
  discordUserId: z.string().min(1),
  accessLevel: z.enum(['MEMBER', 'OBSERVER']).default('MEMBER'),
  actorId: z.string().min(1),
});

export const addTicketNoteSchema = z.object({
  staffDiscordId: z.string().min(1),
  content: z.string().min(1).max(2000),
});

export const rateTicketSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(1000).optional(),
});

