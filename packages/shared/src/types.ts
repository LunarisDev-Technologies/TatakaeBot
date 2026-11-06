export enum TicketStatus {
  OPEN = 'OPEN',
  CLAIMED = 'CLAIMED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED',
}

export enum ModerationAction {
  WARN = 'WARN',
  TIMEOUT = 'TIMEOUT',
  KICK = 'KICK',
  BAN = 'BAN',
  UNBAN = 'UNBAN',
  REMOVE_TIMEOUT = 'REMOVE_TIMEOUT',
}

export enum AuditEntityType {
  GUILD = 'GUILD',
  TICKET = 'TICKET',
  BOOKING = 'BOOKING',
  MODERATION = 'MODERATION',
  MEMBER = 'MEMBER',
  ROLE = 'ROLE',
  SETTING = 'SETTING',
  AUTOMATION = 'AUTOMATION',
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    timestamp: string;
  };
}

export interface DiscordUserIdentity {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string | null;
}

export interface AuthSessionUser {
  id: string;
  discordId: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  guildId: string;
  role: string;
  permissions: string[];
}

