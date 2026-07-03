import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  PROVIDER_CATEGORIES,
  type ProviderCategory,
  VERIFICATION_STATUS,
  type VerificationStatus,
} from "../config/constants.js";

interface IVerificationDocument {
  type: string; // e.g. "GOVERNMENT_ID", "BUSINESS_CERT"
  url: string;
  uploadedAt: Date;
}

interface IWeeklyHours {
  day: number; // 0 = Sunday
  openTime: string; // "09:00"
  closeTime: string; // "18:00"
  isClosed: boolean;
}

export interface IProvider extends Document {
  user: Types.ObjectId;
  category: ProviderCategory;
  businessName: string;
  bio?: string;
  coverImageUrl?: string;
  gallery: string[];
  location: {
    address?: string;
    city?: string;
    state?: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  verification: {
    status: VerificationStatus;
    documents: IVerificationDocument[];
    reviewedBy?: Types.ObjectId;
    reviewedAt?: Date;
    rejectionReason?: string;
  };
  availability: {
    timezone: string;
    weeklyHours: IWeeklyHours[];
  };
  commissionRate: number;
  ratingAverage: number;
  ratingCount: number;
  isSuspended: boolean;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// This is the ONE profile every provider type shares — dashboard,
// verification/KYC, earnings, ratings. Category-specific data lives on
// the Listing discriminators, not here, so this model never needs to
// change when a new vertical is added.
const providerSchema = new Schema<IProvider>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    category: {
      type: String,
      enum: Object.values(PROVIDER_CATEGORIES),
      required: true,
    },

    businessName: { type: String, required: true, trim: true },
    bio: { type: String },
    coverImageUrl: { type: String },
    gallery: [{ type: String }],

    location: {
      address: String,
      city: String,
      state: String,
      country: { type: String, default: "Nigeria" },
      lat: Number,
      lng: Number,
    },

    verification: {
      status: {
        type: String,
        enum: Object.values(VERIFICATION_STATUS),
        default: VERIFICATION_STATUS.UNVERIFIED,
      },
      documents: [
        {
          type: { type: String },
          url: String,
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,
      rejectionReason: String,
    },

    // Weekly availability template; specific bookings/blocked dates
    // live on Booking / a CalendarSlot collection per listing.
    availability: {
      timezone: { type: String, default: "Africa/Lagos" },
      weeklyHours: [
        {
          day: { type: Number, min: 0, max: 6 },
          openTime: String,
          closeTime: String,
          isClosed: { type: Boolean, default: false },
        },
      ],
    },

    commissionRate: { type: Number, default: 0.1 }, // 10% platform default

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    isSuspended: { type: Boolean, default: false },
    suspensionReason: String,
  },
  { timestamps: true }
);

providerSchema.index({ category: 1 });
providerSchema.index({ "location.city": 1, category: 1 });

export const Provider: Model<IProvider> = mongoose.model<IProvider>(
  "Provider",
  providerSchema
);
