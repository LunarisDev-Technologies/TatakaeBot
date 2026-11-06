import { AuditLogModel } from '@tatakae/database';
import { logger } from '@tatakae/logger';
import { AuditEntityType } from '@tatakae/shared';

export interface RecordAuditParams {
  guildId: string;
  actorId: string;
  action: string;
  entityType: AuditEntityType | string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  async record(params: RecordAuditParams) {
    try {
      const entry = await AuditLogModel.create({
        guildId: params.guildId,
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata || {},
      });
      return entry;
    } catch (error) {
      logger.error({ err: error, params }, 'Failed to record audit log entry');
      return null;
    }
  }

  async getLogs(guildId: string, limit = 50, offset = 0) {
    return AuditLogModel.find({ guildId })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();
  }
}

export const auditService = new AuditService();
