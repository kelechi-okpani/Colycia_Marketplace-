import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IReview extends Document {
  booking: Types.ObjectId;
  listing: Types.ObjectId;
  provider: Types.ObjectId;
  author: Types.ObjectId; // customer who booked
  rating: number; // 1-5
  comment?: string;
  providerReply?: string;
  isHidden: boolean; // admin moderation
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    providerReply: String,
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// one review per booking — enforced at the schema level, not just app logic
reviewSchema.index({ booking: 1 }, { unique: true });
reviewSchema.index({ listing: 1, createdAt: -1 });
reviewSchema.index({ provider: 1 });

export const Review: Model<IReview> = mongoose.model<IReview>(
  "Review",
  reviewSchema
);
