import { Schema, model, Document, models } from 'mongoose';

export interface IGuild {
  _id: string;
  id: string; // Discord Guild Snowflake
  name: string;
  icon?: string;
  ownerId: string;
  memberCount: number;
  active: boolean;
  prefix: string;
  timezone: string;
  logChannelId?: string;
  modLogChannelId?: string;
  welcomeChannelId?: string;
  verificationRoleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GuildSchema = new Schema<IGuild>(
  {
    _id: { type: String, required: true },
    id: { type: String, required: true, index: true },
    name: { type: String, required: true },
    icon: { type: String },
    ownerId: { type: String, required: true },
    memberCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
    prefix: { type: String, default: '!' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    logChannelId: { type: String },
    modLogChannelId: { type: String },
    welcomeChannelId: { type: String },
    verificationRoleId: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_: any, ret: any) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const GuildModel = models.Guild || model<IGuild>('Guild', GuildSchema);
