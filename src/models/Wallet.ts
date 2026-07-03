import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IWallet extends Document {
  owner: Types.ObjectId; // User
  balance: number;
  pendingBalance: number; // funds held until booking completion (escrow-style)
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    pendingBalance: { type: Number, default: 0 },
    currency: { type: String, default: "NGN" },
  },
  { timestamps: true }
);

walletSchema.index({ owner: 1 });

export const Wallet: Model<IWallet> = mongoose.model<IWallet>("Wallet", walletSchema);