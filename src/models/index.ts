// Import order matters for discriminators: the base Listing model must
// be registered before its discriminators attach to it. Importing this
// single file from server.ts guarantees that.

export { User, IUser } from "./User";
export { Provider, IProvider } from "./Provider";
export { Booking, IBooking } from "./Booking";
export { Wallet, IWallet } from "./Wallet";
export { Transaction, ITransaction } from "./Transaction";
export { Review, IReview } from "./Review";
export { Conversation, IConversation } from "./Conversation";
export { Message, IMessage } from "./Message";
export { Notification, INotification } from "./Notification";

export { Listing, IListing } from "./listings/Listing";
export { HotelListing, IHotelListing } from "./listings/HotelListing";
export { AirbnbListing, IAirbnbListing } from "./listings/AirbnbListing";
export { CarRentalListing, ICarRentalListing } from "./listings/CarRentalListing";
export { FoodVendorListing, IFoodVendorListing } from "./listings/FoodVendorListing";
export { SalonListing, ISalonListing } from "./listings/SalonListing";
export { AirlineListing, IAirlineListing } from "./listings/AirlineListing";
export { TourGuideListing, ITourGuideListing } from "./listings/TourGuideListing";
export { MakeupArtistListing, IMakeupArtistListing } from "./listings/MakeupArtistListing";
export { PhotographerListing, IPhotographerListing } from "./listings/PhotographerListing";
export { EventCenterListing, IEventCenterListing } from "./listings/EventCenterListing";
export { MassageTherapyListing, IMassageTherapyListing } from "./listings/MassageTherapyListing";
export { TherapyListing, ITherapyListing } from "./listings/TherapyListing";
