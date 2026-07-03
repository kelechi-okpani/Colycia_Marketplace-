import { Schema } from "mongoose";
import { Listing, type IListing } from "./Listing.js";
import { PROVIDER_CATEGORIES } from "../../config/constants.js";

export interface IAirbnbListing extends IListing {
  propertyType?: "APARTMENT" | "HOUSE" | "STUDIO" | "SHARED_ROOM" | "VILLA";
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  houseRules: string[];
  amenities: string[];
  blockedDates: { start: Date; end: Date }[];
  cancellationPolicy?: string;
}

export const AirbnbListing = Listing.discriminator<IAirbnbListing>(
  PROVIDER_CATEGORIES.AIRBNB_HOST,
  new Schema<IAirbnbListing>({
    propertyType: {
      type: String,
      enum: ["APARTMENT", "HOUSE", "STUDIO", "SHARED_ROOM", "VILLA"],
    },
    bedrooms: Number,
    bathrooms: Number,
    maxGuests: Number,
    houseRules: [String],
    amenities: [String],
    // blocked/available date ranges, kept lightweight; heavy calendar logic
    // can move to a dedicated CalendarSlot collection as volume grows
    blockedDates: [{ start: Date, end: Date }],
    cancellationPolicy: String,
  })
);
