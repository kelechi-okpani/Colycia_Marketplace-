import { Schema } from "mongoose";
import { Listing, type IListing } from "./Listing.js";
import { PROVIDER_CATEGORIES } from "../../config/constants.js";

export interface ICarRentalListing extends IListing {
  make?: string;
  carModel?: string;
  year?: number;
  transmission?: "AUTOMATIC" | "MANUAL";
  seats?: number;
  pricePerDay?: number;
  pricePerHour?: number;
  driverOptionAvailable: boolean;
  driverFee?: number;
  pickupLocations: string[];
  dropoffLocations: string[];
  blockedDates: { start: Date; end: Date }[];
}

export const CarRentalListing = Listing.discriminator<ICarRentalListing>(
  PROVIDER_CATEGORIES.CAR_RENTAL,
  new Schema<ICarRentalListing>({
    make: String,
    carModel: String,
    year: Number,
    transmission: { type: String, enum: ["AUTOMATIC", "MANUAL"] },
    seats: Number,
    pricePerDay: Number,
    pricePerHour: Number,
    driverOptionAvailable: { type: Boolean, default: false },
    driverFee: Number,
    pickupLocations: [String],
    dropoffLocations: [String],
    blockedDates: [{ start: Date, end: Date }],
  })
);
