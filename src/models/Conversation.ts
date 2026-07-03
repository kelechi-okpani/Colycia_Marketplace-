import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[]; // exactly 2 for now: customer + provider's user
  relatedBooking?: Types.ObjectId;
  lastMessagePreview?: string;
  lastMessageAt?: Date;
  // set true when the conversation is attached to a therapy booking, so
  // the API layer can apply the enhanced-privacy access checks noted on
  // TherapyListing rather than baking that logic into the schema itself
  isEnhancedPrivacy: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    relatedBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
    lastMessagePreview: String,
    lastMessageAt: Date,
    isEnhancedPrivacy: { type: Boolean, default: false },
  },
  { timestamps: true }
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export const Conversation: Model<IConversation> = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
