import { ModerationCaseModel } from '@tatakae/database';
import { logger } from '@tatakae/logger';
import { AuditEntityType, ModerationAction } from '@tatakae/shared';
import { auditService } from '../../audit/audit.service.js';
import { z } from 'zod';
import { moderationActionSchema } from '../schemas/moderation.schemas.js';

export class ModerationService {
  async recordCase(input: z.infer<typeof moderationActionSchema>) {
    const lastCase: any = await ModerationCaseModel.findOne({ guildId: input.guildId })
      .sort({ caseNumber: -1 })
      .select('caseNumber')
      .lean();
    const caseNumber = (lastCase?.caseNumber || 0) + 1;

    const expiresAt = input.durationSeconds
      ? new Date(Date.now() + input.durationSeconds * 1000)
      : undefined;

    const modCase = await ModerationCaseModel.create({
      guildId: input.guildId,
      caseNumber,
      userId: input.userId,
      moderatorId: input.moderatorId,
      action: input.action,
      reason: input.reason,
      durationSeconds: input.durationSeconds,
      expiresAt,
    });

    await auditService.record({
      guildId: input.guildId,
      actorId: input.moderatorId,
      action: `MODERATION_${input.action}`,
      entityType: AuditEntityType.MODERATION,
      entityId: modCase._id.toString(),
      metadata: { targetUser: input.userId, reason: input.reason, caseNumber },
    });

    logger.info({ caseNumber, action: input.action, userId: input.userId }, 'Recorded moderation action');
    return modCase;
  }

  async getHistory(guildId: string, userId: string) {
    return ModerationCaseModel.find({ guildId, userId }).sort({ createdAt: -1 }).lean();
  }

  async getRecentCases(guildId: string, limit = 20) {
    return ModerationCaseModel.find({ guildId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  async countCases(guildId: string): Promise<number> {
    return ModerationCaseModel.countDocuments({ guildId });
  }
}

export const moderationService = new ModerationService();
