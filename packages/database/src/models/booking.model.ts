import { Schema, model, Document, models } from 'mongoose';
import { BookingStatus } from '@tatakae/shared';

export interface IBookingService extends Document {
  id: string;
  guildId: string;
  name: string;
  description?: string;
  durationMinutes: number;
  bufferMinutes: number;
  capacity: number;
  active: boolean;
}

const BookingServiceSchema = new Schema<IBookingService>(
  {
    guildId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    durationMinutes: { type: Number, default: 30 },
    bufferMinutes: { type: Number, default: 15 },
    capacity: { type: Number, default: 1 },
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

export const BookingServiceModel =
  models.BookingService || model<IBookingService>('BookingService', BookingServiceSchema);

export interface IBooking extends Document {
  id: string;
  guildId: string;
  serviceId: string;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  discordId: string;
  purpose: string;
  startAt: Date;
  endAt: Date;
  status: BookingStatus;
  notes?: string;
  staffDiscordId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    guildId: { type: String, required: true, index: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    clientName: { type: String, required: true },
    clientEmail: { type: String, required: true },
    discordId: { type: String, required: true, index: true },
    purpose: { type: String, required: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(BookingStatus),
      default: BookingStatus.PENDING,
      index: true,
    },
    notes: { type: String },
    staffDiscordId: { type: String },
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

BookingSchema.index({ guildId: 1, startAt: 1, endAt: 1 });

export const BookingModel = models.Booking || model<IBooking>('Booking', BookingSchema);
