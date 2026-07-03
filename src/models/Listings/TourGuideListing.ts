import { Schema, Types } from "mongoose";
import { Listing, type IListing } from "./Listing.js";
import { PROVIDER_CATEGORIES } from "../../config/constants.js";

export interface ITourPackage {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  durationHours: number;
  price: number;
  maxGroupSize?: number;
  isPrivateOnly: boolean;
}

export interface ITourGuideListing extends IListing {
  packages: ITourPackage[];
  languagesSpoken: string[];
  coverageAreas: string[];
  schedule: { date: Date; isFullyBooked: boolean }[];
}

const tourPackageSchema = new Schema<ITourPackage>(
  {
    name: String,
    description: String,
    durationHours: Number,
    price: Number,
    maxGroupSize: Number,
    isPrivateOnly: { type: Boolean, default: false },
  },
  { _id: true }
);

export const TourGuideListing = Listing.discriminator<ITourGuideListing>(
  PROVIDER_CATEGORIES.TOUR_GUIDE,
  new Schema<ITourGuideListing>({
    packages: [tourPackageSchema],
    languagesSpoken: [String],
    coverageAreas: [String],
    schedule: [
      { date: Date, isFullyBooked: { type: Boolean, default: false } },
    ],
  })
);
