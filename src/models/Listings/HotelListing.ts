import { Schema, Types } from "mongoose";
import { Listing, IListing } from "./Listing";
import { PROVIDER_CATEGORIES } from "../../config/constants";

export interface IRoomType {
  _id: Types.ObjectId;
  name: string;
  pricePerNight: number;
  totalRooms: number;
  maxOccupancy: number;
  amenities: string[];
  photos: string[];
}

export interface IHotelListing extends IListing {
  roomTypes: IRoomType[];
  amenities: string[]; // hotel-wide: pool, wifi, parking...
  checkInTime: string;
  checkOutTime: string;
  starRating?: number;
  cancellationPolicy?: string;
}

const roomTypeSchema = new Schema<IRoomType>(
  {
    name: String,
    pricePerNight: Number,
    totalRooms: Number,
    maxOccupancy: Number,
    amenities: [String],
    photos: [String],
  },
  { _id: true }
);

export const HotelListing = Listing.discriminator<IHotelListing>(
  PROVIDER_CATEGORIES.HOTEL,
  new Schema<IHotelListing>({
    roomTypes: [roomTypeSchema],
    amenities: [String],
    checkInTime: { type: String, default: "14:00" },
    checkOutTime: { type: String, default: "12:00" },
    starRating: { type: Number, min: 1, max: 5 },
    cancellationPolicy: String,
  })
);
