import { Schema, Types } from "mongoose";
import { Listing, IListing } from "./Listing";
import { PROVIDER_CATEGORIES } from "../../config/constants";

export interface ISessionPackage {
  _id: Types.ObjectId;
  name: string; // "Wedding Full Day", "1hr Portrait"
  price: number;
  durationHours: number;
  editedPhotosIncluded?: number;
  deliveryDays?: number;
}

export interface IPhotographerListing extends IListing {
  portfolio: string[];
  sessionPackages: ISessionPackage[];
  specialties: string[]; // "Wedding", "Product", "Portrait", "Event"
  equipmentHighlights: string[];
}

const sessionPackageSchema = new Schema<ISessionPackage>(
  {
    name: String,
    price: Number,
    durationHours: Number,
    editedPhotosIncluded: Number,
    deliveryDays: Number,
  },
  { _id: true }
);

export const PhotographerListing = Listing.discriminator<IPhotographerListing>(
  PROVIDER_CATEGORIES.PHOTOGRAPHER,
  new Schema<IPhotographerListing>({
    portfolio: [String],
    sessionPackages: [sessionPackageSchema],
    specialties: [String],
    equipmentHighlights: [String],
  })
);
