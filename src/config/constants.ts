// Central place for enums so new verticals are added in ONE place.
// To add a new service category later:
//   1. add it to ProviderCategory below
//   2. create a discriminator model in models/listings/
//   3. add a small resolver module
// Nothing else in the system needs to change — this is what keeps the
// platform scalable without rebuilding.

export const ROLES = {
  CUSTOMER: "CUSTOMER",
  PROVIDER: "PROVIDER",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const PROVIDER_CATEGORIES = {
  HOTEL: "HOTEL",
  AIRBNB_HOST: "AIRBNB_HOST",
  CAR_RENTAL: "CAR_RENTAL",
  FOOD_VENDOR: "FOOD_VENDOR",
  SALON: "SALON",
  AIRLINE: "AIRLINE",
  TOUR_GUIDE: "TOUR_GUIDE",
  MAKEUP_ARTIST: "MAKEUP_ARTIST",
  PHOTOGRAPHER: "PHOTOGRAPHER",
  EVENT_CENTER: "EVENT_CENTER",
  MASSAGE_THERAPY: "MASSAGE_THERAPY",
  PROFESSIONAL_THERAPY: "PROFESSIONAL_THERAPY",
} as const;
export type ProviderCategory =
  (typeof PROVIDER_CATEGORIES)[keyof typeof PROVIDER_CATEGORIES];

export const VERIFICATION_STATUS = {
  UNVERIFIED: "UNVERIFIED",
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;
export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

export const BOOKING_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  DISPUTED: "DISPUTED",
} as const;
export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PAID: "PAID",
  PARTIALLY_PAID: "PARTIALLY_PAID",
  REFUNDED: "REFUNDED",
  FAILED: "FAILED",
} as const;
export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

export const TRANSACTION_TYPE = {
  DEPOSIT: "DEPOSIT",
  WITHDRAWAL: "WITHDRAWAL",
  PAYMENT: "PAYMENT",
  PAYOUT: "PAYOUT",
  COMMISSION: "COMMISSION",
  REFUND: "REFUND",
} as const;
export type TransactionType =
  (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

export const NOTIFICATION_CHANNEL = {
  EMAIL: "EMAIL",
  SMS: "SMS",
  PUSH: "PUSH",
  IN_APP: "IN_APP",
} as const;
export type NotificationChannel =
  (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];

export const LISTING_STATUS = {
  DRAFT: "DRAFT",
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  ARCHIVED: "ARCHIVED",
} as const;
export type ListingStatus =
  (typeof LISTING_STATUS)[keyof typeof LISTING_STATUS];
