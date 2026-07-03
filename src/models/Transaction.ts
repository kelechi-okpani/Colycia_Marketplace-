import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { TRANSACTION_TYPE, TransactionType } from "../config/constants";

export interface ITransaction extends Document {
  wallet: Types.ObjectId;
  type: TransactionType;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED";
  relatedBooking?: Types.ObjectId;
  reference: string; // idempotency key / payment provider reference
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    wallet: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    type: { type: String, enum: Object.values(TRANSACTION_TYPE), required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
    status: { type: String, enum: ["PENDING", "SUCCESS", "FAILED"], default: "PENDING" },
    relatedBooking: { type: Schema.Types.ObjectId, ref: "Booking" },
    reference: { type: String, required: true, unique: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

transactionSchema.index({ wallet: 1, createdAt: -1 });

export const Transaction: Model<ITransaction> = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);
