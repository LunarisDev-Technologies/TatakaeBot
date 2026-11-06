import { Schema, model, Document, models } from 'mongoose';
import { ModerationAction } from '@tatakae/shared';

export interface IModerationCase extends Document {
  id: string;
  guildId: string;
  caseNumber: number;
  userId: string; // Target Discord Snowflake
  moderatorId: string; // Moderator Snowflake
  action: ModerationAction;
  reason: string;
  durationSeconds?: number;
  expiresAt?: Date;
  active: boolean;
  createdAt: Date;
}

const ModerationCaseSchema = new Schema<IModerationCase>(
  {
    guildId: { type: String, required: true, index: true },
    caseNumber: { type: Number, required: true },
    userId: { type: String, required: true, index: true },
    moderatorId: { type: String, required: true },
    action: {
      type: String,
      enum: Object.values(ModerationAction),
      required: true,
    },
    reason: { type: String, default: 'No reason provided' },
    durationSeconds: { type: Number },
    expiresAt: { type: Date },
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

ModerationCaseSchema.index({ guildId: 1, caseNumber: 1 }, { unique: true });

export const ModerationCaseModel =
  models.ModerationCase || model<IModerationCase>('ModerationCase', ModerationCaseSchema);
