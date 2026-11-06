import { z } from 'zod';
import { ModerationAction } from '@tatakae/shared';

export const moderationActionSchema = z.object({
  guildId: z.string().min(1),
  userId: z.string().min(1),
  moderatorId: z.string().min(1),
  action: z.nativeEnum(ModerationAction),
  reason: z.string().max(500).default('No reason provided'),
  durationSeconds: z.number().int().positive().optional(),
});

