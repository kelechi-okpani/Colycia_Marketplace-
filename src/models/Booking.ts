import mongoose, { Schema, Document, Model, Types } from "mongoose";
import {
  BOOKING_STATUS,
  BookingStatus,
  PAYMENT_STATUS,
  PaymentStatus,
  PROVIDER_CATEGORIES,
  ProviderCategory,
} from "../config/constants";

export interface IBooking extends Document {
  customer: Types.ObjectId;
  provider: Types.ObjectId;
  listing: Types.ObjectId;
  category: ProviderCategory;

  // Free-form but predictable per category, e.g.
  // Hotel: { roomTypeId, checkIn, checkOut, guests }
  // Salon: { servicePackageId, staffId, slot }
  // CarRental: { pickupLocation, dropoffLocation, withDriver, start, end }
  selection: Record<string, unknown>;

  scheduledStart?: Date;
  scheduledEnd?: Date;

  quantity: number;
  unitPrice: number;
  subtotal: number;
  commissionAmount: number;
  totalAmount: number;
  currency: string;

  status: BookingStatus;
  paymentStatus: PaymentStatus;

  cancellationReason?: string;
  cancelledBy?: Types.ObjectId;

  disputeReason?: string;
  disputeResolvedBy?: Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

// One Booking schema serves every vertical. Category-specific details
// (room type chosen, which staff member, which hall) go in `selection`
// as a flexible sub-document rather than spawning 12 Booking variants —
// bookings don't need discriminator-level querying the way listings do.
const bookingSchema = new Schema<IBooking>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    provider: { type: Schema.Types.ObjectId, ref: "Provider", required: true },
    listing: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    category: { type: String, enum: Object.values(PROVIDER_CATEGORIES), required: true },

    selection: { type: Schema.Types.Mixed, default: {} },

    scheduledStart: { type: Date },
    scheduledEnd: { type: Date },

    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },

    cancellationReason: String,
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },

    disputeReason: String,
    disputeResolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

bookingSchema.index({ customer: 1, createdAt: -1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ listing: 1 });

export const Booking: Model<IBooking> = mongoose.model<IBooking>("Booking", bookingSchema);
