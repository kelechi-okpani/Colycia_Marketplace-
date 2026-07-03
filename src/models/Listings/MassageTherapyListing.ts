import { Schema, Types } from "mongoose";
import { Listing, type IListing } from "./Listing.js";
import { PROVIDER_CATEGORIES } from "../../config/constants.js";

export interface IWellnessPackage {
  _id: Types.ObjectId;
  name: string; // "Deep Tissue 60min", "Couples Massage"
  durationMinutes: number;
  price: number;
}

export interface IMassageTherapyListing extends IListing {
  wellnessPackages: IWellnessPackage[];
  homeServiceAvailable: boolean;
  spaServiceAvailable: boolean;
  therapistNames: string[];
  travelFee?: number;
}

const wellnessPackageSchema = new Schema<IWellnessPackage>(
  { name: String, durationMinutes: Number, price: Number },
  { _id: true }
);

export const MassageTherapyListing =
  Listing.discriminator<IMassageTherapyListing>(
    PROVIDER_CATEGORIES.MASSAGE_THERAPY,
    new Schema<IMassageTherapyListing>({
      wellnessPackages: [wellnessPackageSchema],
      homeServiceAvailable: { type: Boolean, default: true },
      spaServiceAvailable: { type: Boolean, default: true },
      therapistNames: [String],
      travelFee: Number,
    })
  );
