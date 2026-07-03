import { Schema, Types } from "mongoose";
import { Listing, IListing } from "./Listing";
import { PROVIDER_CATEGORIES } from "../../config/constants";

export interface IHall {
  _id: Types.ObjectId;
  name: string;
  capacity: number;
  pricePerDay: number;
  photos: string[];
  amenities: string[]; // "AC", "Sound system", "Parking"
}

export interface IEventCenterListing extends IListing {
  halls: IHall[];
  bookedDates: { start: Date; end: Date; hallId: Types.ObjectId }[];
  cateringAvailable: boolean;
  decorationAvailable: boolean;
}

const hallSchema = new Schema<IHall>(
  {
    name: String,
    capacity: Number,
    pricePerDay: Number,
    photos: [String],
    amenities: [String],
  },
  { _id: true }
);

export const EventCenterListing = Listing.discriminator<IEventCenterListing>(
  PROVIDER_CATEGORIES.EVENT_CENTER,
  new Schema<IEventCenterListing>({
    halls: [hallSchema],
    bookedDates: [{ start: Date, end: Date, hallId: Schema.Types.ObjectId }],
    cateringAvailable: { type: Boolean, default: false },
    decorationAvailable: { type: Boolean, default: false },
  })
);
