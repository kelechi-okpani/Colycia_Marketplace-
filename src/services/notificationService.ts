import { Notification } from "../models/Notification";
import { NOTIFICATION_CHANNEL, NotificationChannel } from "../config/constants";
import type { Types } from "mongoose";

export interface SendNotificationInput {
  userId: Types.ObjectId | string;
  title: string;
  body: string;
  channel?: NotificationChannel;
  relatedBooking?: Types.ObjectId | string;
}

// Always writes the IN_APP record so the notification shows in-app
// regardless of channel; then fans out to email/SMS/push providers.
// Wire SendGrid/Twilio/FCM into the switch below when credentials exist.
export async function sendNotification(input: SendNotificationInput): Promise<void> {
  await Notification.create({
    user: input.userId,
    title: input.title,
    body: input.body,
    channel: input.channel ?? NOTIFICATION_CHANNEL.IN_APP,
    relatedBooking: input.relatedBooking,
  });

  switch (input.channel) {
    case NOTIFICATION_CHANNEL.EMAIL:
      console.log(`[notify] (stub) email -> user ${input.userId}: ${input.title}`);
      break;
    case NOTIFICATION_CHANNEL.SMS:
      console.log(`[notify] (stub) sms -> user ${input.userId}: ${input.title}`);
      break;
    case NOTIFICATION_CHANNEL.PUSH:
      console.log(`[notify] (stub) push -> user ${input.userId}: ${input.title}`);
      break;
    default:
      break;
  }
}
