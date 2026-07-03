import { mergeResolvers } from "@graphql-tools/merge";
import { DateTimeScalar, JSONScalar } from "./scalars";
import { userResolvers } from "./userResolvers";
import { providerResolvers } from "./providerResolvers";
import { listingResolvers } from "./listingResolvers";
import { bookingResolvers } from "./bookingResolvers";
import { walletResolvers } from "./walletResolvers";
import { reviewResolvers } from "./reviewResolvers";
import { chatResolvers } from "./chatResolvers";
import { notificationResolvers } from "./notificationResolvers";
import { adminResolvers } from "./adminResolvers";

const scalarResolvers = {
  DateTime: DateTimeScalar,
  JSON: JSONScalar,
};

export const resolvers = mergeResolvers([
  scalarResolvers,
  userResolvers,
  providerResolvers,
  listingResolvers,
  bookingResolvers,
  walletResolvers,
  reviewResolvers,
  chatResolvers,
  notificationResolvers,
  adminResolvers,
]);
