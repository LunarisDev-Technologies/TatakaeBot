import { Schema, model, Document, models } from 'mongoose';
import { TicketStatus, TicketPriority } from '@tatakae/shared';

export interface ITicketCategory extends Document {
  id: string;
  guildId: string;
  name: string;
  description?: string;
  emoji?: string;
  ticketNamingPattern: string;
  autoCloseHours: number;
  active: boolean;
}

const TicketCategorySchema = new Schema<ITicketCategory>(
  {
    guildId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    emoji: { type: String, default: '🎫' },
    ticketNamingPattern: { type: String, default: 'ticket-{number}' },
    autoCloseHours: { type: Number, default: 72 },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const TicketCategoryModel =
  models.TicketCategory || model<ITicketCategory>('TicketCategory', TicketCategorySchema);

export interface ITicket extends Document {
  id: string;
  guildId: string;
  ticketNumber: number;
  userId?: string;
  creatorDiscord: string;
  creatorUsername: string;
  creatorAvatar?: string;
  categoryId?: string;
  categoryName: string;
  status: TicketStatus;
  priority: TicketPriority;
  channelId?: string;
  subject?: string;
  initialAnswers: Record<string, any>;
  staffDiscordId?: string;
  closedAt?: Date;
  closedById?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
  {
    guildId: { type: String, required: true, index: true },
    ticketNumber: { type: Number, required: true },
    userId: { type: String },
    creatorDiscord: { type: String, required: true, index: true },
    creatorUsername: { type: String, required: true },
    creatorAvatar: { type: String },
    categoryId: { type: String },
    categoryName: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(TicketPriority),
      default: TicketPriority.NORMAL,
    },
    channelId: { type: String, index: true },
    subject: { type: String },
    initialAnswers: { type: Schema.Types.Mixed, default: {} },
    staffDiscordId: { type: String },
    closedAt: { type: Date },
    closedById: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: any, ret: any) => {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

TicketSchema.index({ guildId: 1, ticketNumber: 1 }, { unique: true });

export const TicketModel = models.Ticket || model<ITicket>('Ticket', TicketSchema);

export interface ITicketMessage extends Document {
  ticketId: string;
  discordMessageId?: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  attachments: any[];
  createdAt: Date;
}

const TicketMessageSchema = new Schema<ITicketMessage>(
  {
    ticketId: { type: String, required: true, index: true },
    discordMessageId: { type: String },
    authorId: { type: String, required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String },
    content: { type: String, required: true },
    attachments: { type: Schema.Types.Mixed, default: [] },
  },
  {
    timestamps: true,
  }
);

export const TicketMessageModel =
  models.TicketMessage || model<ITicketMessage>('TicketMessage', TicketMessageSchema);

export interface ITicketTranscript extends Document {
  ticketId: string;
  htmlContent: string;
  messageCount: number;
  generatedAt: Date;
}

const TicketTranscriptSchema = new Schema<ITicketTranscript>(
  {
    ticketId: { type: String, required: true, unique: true },
    htmlContent: { type: String, required: true },
    messageCount: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TicketTranscriptModel =
  models.TicketTranscript || model<ITicketTranscript>('TicketTranscript', TicketTranscriptSchema);
