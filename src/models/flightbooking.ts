import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFlightPassengerSnapshot {
  title: string;
  givenName: string;
  familyName: string;
  email: string;
}

export interface IFlightSegmentSnapshot {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departureTime: Date;
  arrivalTime: Date;
  originAirport: string;
  destinationAirport: string;
}

export interface IFlightBooking extends Document {
  customer: Types.ObjectId;
  offerId: string;
  orderId: string; // Duffel order id
  bookingReference: string; // airline PNR
  passengers: IFlightPassengerSnapshot[];
  slices: IFlightSegmentSnapshot[][]; // snapshot at booking time — Duffel offers are ephemeral
  totalPrice: number;
  currency: string;
  status: "CONFIRMED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

// Flights don't go through the generic Booking model because they aren't
// tied to one of our own Listing documents — the "inventory" lives on
// Duffel's side, not ours (see AirlineListing.externalProvider). This is
// our own record of what got booked, purely for display/history/support.
const flightBookingSchema = new Schema<IFlightBooking>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    offerId: { type: String, required: true },
    orderId: { type: String, required: true, unique: true },
    bookingReference: { type: String, required: true },

    passengers: [
      {
        title: String,
        givenName: String,
        familyName: String,
        email: String,
      },
    ],

    slices: [
      [
        {
          airlineCode: String,
          airlineName: String,
          flightNumber: String,
          departureTime: Date,
          arrivalTime: Date,
          originAirport: String,
          destinationAirport: String,
        },
      ],
    ],

    totalPrice: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    status: { type: String, enum: ["CONFIRMED", "CANCELLED"], default: "CONFIRMED" },
  },
  { timestamps: true }
);

flightBookingSchema.index({ customer: 1, createdAt: -1 });

export const FlightBooking: Model<IFlightBooking> = mongoose.model<IFlightBooking>(
  "FlightBooking",
  flightBookingSchema
);