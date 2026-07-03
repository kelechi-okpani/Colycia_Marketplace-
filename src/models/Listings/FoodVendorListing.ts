import { Schema, Types } from "mongoose";
import { Listing, type IListing } from "./Listing.js";
import { PROVIDER_CATEGORIES } from "../../config/constants.js";

export interface IMenuItem {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  photo?: string;
  isAvailable: boolean;
  category?: string; // "Main", "Drinks", "Sides"
}

export interface IFoodVendorListing extends IListing {
  menu: IMenuItem[];
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  deliveryFee?: number;
  estimatedPrepMinutes?: number;
  cuisineTypes: string[];
}

const menuItemSchema = new Schema<IMenuItem>(
  {
    name: String,
    description: String,
    price: Number,
    photo: String,
    isAvailable: { type: Boolean, default: true },
    category: String,
  },
  { _id: true }
);

export const FoodVendorListing = Listing.discriminator<IFoodVendorListing>(
  PROVIDER_CATEGORIES.FOOD_VENDOR,
  new Schema<IFoodVendorListing>({
    menu: [menuItemSchema],
    deliveryAvailable: { type: Boolean, default: true },
    pickupAvailable: { type: Boolean, default: true },
    deliveryFee: Number,
    estimatedPrepMinutes: Number,
    cuisineTypes: [String],
  })
);
