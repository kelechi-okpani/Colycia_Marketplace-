import { Schema, Types } from "mongoose";
import { Listing, IListing } from "./Listing";
import { PROVIDER_CATEGORIES } from "../../config/constants";

export interface ISessionType {
  _id: Types.ObjectId;
  name: string; // "Individual Session", "Couples Session"
  durationMinutes: number;
  price: number;
  mode: "ONLINE" | "IN_PERSON" | "BOTH";
}

export interface ISubscriptionPlan {
  _id: Types.ObjectId;
  name: string;
  sessionsIncluded: number;
  price: number;
  billingCycle: string;
}

export interface ITherapyListing extends IListing {
  credentials: string[]; // licensing bodies, certifications
  specializations: string[];
  sessionTypes: ISessionType[];
  subscriptionPlans: ISubscriptionPlan[];
  // Therapy sessions get an extra layer: bookings for this category are
  // flagged so the API can restrict who can view session notes/messages
  // beyond the standard participant check.
  requiresEnhancedPrivacy: boolean;
}

const sessionTypeSchema = new Schema<ISessionType>(
  {
    name: String,
    durationMinutes: Number,
    price: Number,
    mode: { type: String, enum: ["ONLINE", "IN_PERSON", "BOTH"], default: "BOTH" },
  },
  { _id: true }
);

const subscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  { name: String, sessionsIncluded: Number, price: Number, billingCycle: String },
  { _id: true }
);

export const TherapyListing = Listing.discriminator<ITherapyListing>(
  PROVIDER_CATEGORIES.PROFESSIONAL_THERAPY,
  new Schema<ITherapyListing>({
    credentials: [String],
    specializations: [String],
    sessionTypes: [sessionTypeSchema],
    subscriptionPlans: [subscriptionPlanSchema],
    requiresEnhancedPrivacy: { type: Boolean, default: true },
  })
);
