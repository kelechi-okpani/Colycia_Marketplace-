import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  NOTIFICATION_CHANNEL,
  type NotificationChannel,
} from "../config/constants.js";

export interface INotification extends Document {
  user: Types.ObjectId;
  channel: NotificationChannel;
  title: string;
  body: string;
  isRead: boolean;
  relatedBooking?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    channel: {
      type: String,
      enum: Object.values(NOTIFICATION_CHANNEL),
      default: "IN_APP",
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
