import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  LISTING_STATUS,
  type ListingStatus,
  type ProviderCategory,
} from "../../config/constants.js";

export interface IMedia {
  url: string;
  type: "IMAGE" | "VIDEO";
}

export interface IListing extends Document {
  provider: Types.ObjectId;
  category: ProviderCategory; // set automatically by the discriminator
  title: string;
  description?: string;
  media: IMedia[];
  basePrice: number;
  currency: string;
  location: {
    address?: string;
    city?: string;
    state?: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  status: ListingStatus;
  ratingAverage: number;
  ratingCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Base schema — every listing type (Hotel, Airbnb, CarRental, ...) extends
// this via a Mongoose discriminator keyed on `category`. Shared fields
// (price, media, status, location, search) live here ONCE. Category-only
// fields live in the discriminator schemas in this same folder.
//
// To add a brand-new vertical later:
//   1. add the category to config/constants.ts
//   2. create listings/NewCategoryListing.ts following the pattern below
//   3. require/import it in models/index.ts
//   4. add a small resolver module
// No changes needed to Booking, Payment, Review, or the base Listing.

export const listingBaseOptions = {
  discriminatorKey: "category",
  collection: "listings",
  timestamps: true,
};

const listingSchema = new Schema<IListing>(
  {
    provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },

    title: { type: String, required: true, trim: true },
    description: { type: String },

    media: [
      {
        url: String,
        type: { type: String, enum: ["IMAGE", "VIDEO"], default: "IMAGE" },
      },
    ],

    basePrice: { type: Number, required: true },
    currency: { type: String, default: "NGN" },

    location: {
      address: String,
      city: String,
      state: String,
      country: { type: String, default: "Nigeria" },
      lat: Number,
      lng: Number,
    },

    status: {
      type: String,
      enum: Object.values(LISTING_STATUS),
      default: LISTING_STATUS.DRAFT,
    },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    tags: [String],
  },
  listingBaseOptions
);

listingSchema.index({ title: "text", description: "text", tags: "text" });
listingSchema.index({ category: 1, status: 1 });
listingSchema.index({ "location.city": 1, category: 1 });

export const Listing: Model<IListing> = mongoose.model<IListing>(
  "Listing",
  listingSchema
);
