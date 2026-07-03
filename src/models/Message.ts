import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IMessage extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  body: string;
  attachments: string[];
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, required: true },
    attachments: [String],
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: 1 });

export const Message: Model<IMessage> = mongoose.model<IMessage>("Message", messageSchema);