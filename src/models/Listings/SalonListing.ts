import { Schema, Types } from "mongoose";
import { Listing, IListing } from "./Listing";
import { PROVIDER_CATEGORIES } from "../../config/constants";

export interface IServicePackage {
  _id: Types.ObjectId;
  name: string; // "Full Weave", "Manicure + Pedicure"
  durationMinutes: number;
  price: number;
}

export interface IStaffMember {
  _id: Types.ObjectId;
  name: string;
  photo?: string;
  specialties: string[];
}

export interface ISalonListing extends IListing {
  servicePackages: IServicePackage[];
  staff: IStaffMember[];
  slotDurationMinutes: number;
}

const servicePackageSchema = new Schema<IServicePackage>(
  { name: String, durationMinutes: Number, price: Number },
  { _id: true }
);

const staffMemberSchema = new Schema<IStaffMember>(
  { name: String, photo: String, specialties: [String] },
  { _id: true }
);

export const SalonListing = Listing.discriminator<ISalonListing>(
  PROVIDER_CATEGORIES.SALON,
  new Schema<ISalonListing>({
    servicePackages: [servicePackageSchema],
    staff: [staffMemberSchema],
    slotDurationMinutes: { type: Number, default: 30 },
  })
);
