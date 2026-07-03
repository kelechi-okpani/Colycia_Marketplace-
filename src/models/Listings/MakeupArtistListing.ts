import { Schema, Types } from "mongoose";
import { Listing, IListing } from "./Listing";
import { PROVIDER_CATEGORIES } from "../../config/constants";

export interface IPricingPackage {
  _id: Types.ObjectId;
  name: string; // "Bridal Glam", "Everyday Natural"
  price: number;
  durationMinutes: number;
}

export interface IMakeupArtistListing extends IListing {
  portfolio: string[];
  pricingPackages: IPricingPackage[];
  mobileServiceAvailable: boolean;
  homeStudioAvailable: boolean;
  travelFee?: number;
}

const pricingPackageSchema = new Schema<IPricingPackage>(
  { name: String, price: Number, durationMinutes: Number },
  { _id: true }
);

export const MakeupArtistListing = Listing.discriminator<IMakeupArtistListing>(
  PROVIDER_CATEGORIES.MAKEUP_ARTIST,
  new Schema<IMakeupArtistListing>({
    portfolio: [String],
    pricingPackages: [pricingPackageSchema],
    mobileServiceAvailable: { type: Boolean, default: true },
    homeStudioAvailable: { type: Boolean, default: false },
    travelFee: Number,
  })
);
