import { sharedTypeDefs } from "./shared";
import { userTypeDefs } from "./user";
import { providerTypeDefs } from "./provider";
import { listingTypeDefs } from "./listing";
import { bookingTypeDefs } from "./booking";
import { walletTypeDefs } from "./wallet";
import { reviewTypeDefs } from "./review";
import { chatTypeDefs } from "./chat";
import { notificationTypeDefs } from "./notification";
import { adminTypeDefs } from "./admin";
import { mediaTypeDefs } from "./media";

// Order matters only in that `shared` (which declares the base Query/
// Mutation types) must come first; every other module uses `extend type`.
export const typeDefs = [
  sharedTypeDefs,
  userTypeDefs,
  providerTypeDefs,
  listingTypeDefs,
  bookingTypeDefs,
  walletTypeDefs,
  reviewTypeDefs,
  chatTypeDefs,
  notificationTypeDefs,
  adminTypeDefs,
  mediaTypeDefs,
];