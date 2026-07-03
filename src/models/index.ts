// Import order matters for discriminators: the base Listing model must
// be registered before its discriminators attach to it. Importing this
// single file from server.ts guarantees that.

export { User, type IUser } from "./User.js";
export { Provider, type IProvider } from "./Provider.js";
export { Booking, type IBooking } from "./Booking.js";
export { Wallet, type IWallet } from "./Wallet.js";
export { Transaction, type ITransaction } from "./Transaction.js";
export { Review, type IReview } from "./Review.js";
export { Conversation, type IConversation } from "./Conversation.js";
export { Message, type IMessage } from "./Message.js";
export { Notification, type INotification } from "./Notification.js";

export { Listing, type IListing } from "../models/Listings/Listing.js";
export {
  HotelListing,
  type IHotelListing,
} from "../models/Listings/HotelListing.js";
export {
  AirbnbListing,
  type IAirbnbListing,
} from "../models/Listings/AirbnbListing.js";
export {
  CarRentalListing,
  type ICarRentalListing,
} from "../models/Listings/CarRentalListing.js";
export {
  FoodVendorListing,
  type IFoodVendorListing,
} from "../models/Listings/FoodVendorListing.js";
export {
  SalonListing,
  type ISalonListing,
} from "../models/Listings/SalonListing.js";
export {
  AirlineListing,
  type IAirlineListing,
} from "../models/Listings/AirlineListing.js";
export {
  TourGuideListing,
  type ITourGuideListing,
} from "../models/Listings/TourGuideListing.js";
export {
  MakeupArtistListing,
  type IMakeupArtistListing,
} from "../models/Listings/MakeupArtistListing.js";
export {
  PhotographerListing,
  type IPhotographerListing,
} from "../models/Listings/PhotographerListing.js";
export {
  EventCenterListing,
  type IEventCenterListing,
} from "../models/Listings/EventCenterListing.js";
export {
  MassageTherapyListing,
  type IMassageTherapyListing,
} from "../models/Listings/MassageTherapyListing.js";
export {
  TherapyListing,
  type ITherapyListing,
} from "../models/Listings/TherapyListing.js";
