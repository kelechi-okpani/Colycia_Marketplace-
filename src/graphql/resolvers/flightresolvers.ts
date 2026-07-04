import { GraphQLError } from "graphql";
import { searchFlights, getOffer, bookFlight, FlightSearchInput, BookFlightInput } from "../../services/flightSearchService";
import { Wallet } from "../../models/Wallet";
import { Transaction } from "../../models/Transaction";
import { FlightBooking } from "../../models/flightbooking";
import { requireAuth } from "../../middleware/permissions";
import { generateReference } from "../../utils/reference";
import { TRANSACTION_TYPE } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";

export const flightResolvers = {
  Query: {
    searchFlights: (_: unknown, { input }: { input: FlightSearchInput }) => searchFlights(input),

    myFlightBookings: async (
      _: unknown,
      { page = 1, pageSize = 20 }: { page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      return FlightBooking.find({ customer: user.id })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });
    },
  },

  Mutation: {
    bookFlight: async (_: unknown, { input }: { input: BookFlightInput }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);

      // Revalidate price server-side — never trust a price the client
      // cached from an earlier search; offers expire and prices move.
      const offer = await getOffer(input.offerId);
      if (new Date(offer.expiresAt) < new Date()) {
        throw new GraphQLError("This flight offer has expired. Please search again.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const wallet = await Wallet.findOne({ owner: user.id });
      if (!wallet) throw new GraphQLError("Wallet not found.", { extensions: { code: "NOT_FOUND" } });
      if (wallet.balance < offer.totalPrice) {
        throw new GraphQLError("Insufficient wallet balance for this flight. Please top up first.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      // Charge first, then book — if Duffel booking fails, refund immediately
      // rather than leaving the customer's money in limbo.
      wallet.balance -= offer.totalPrice;
      await wallet.save();

      const reference = generateReference("FLT");
      await Transaction.create({
        wallet: wallet._id,
        type: TRANSACTION_TYPE.PAYMENT,
        amount: offer.totalPrice,
        currency: offer.currency,
        status: "SUCCESS",
        reference,
        metadata: { direction: "debit", offerId: input.offerId },
      });

      try {
        const result = await bookFlight(input);

        // This is the piece that was missing — without this, the booking
        // succeeded with the airline but the customer had no way to ever
        // see it again in-app.
        await FlightBooking.create({
          customer: user.id,
          offerId: input.offerId,
          orderId: result.orderId,
          bookingReference: result.bookingReference,
          passengers: input.passengers.map((p) => ({
            title: p.title,
            givenName: p.givenName,
            familyName: p.familyName,
            email: p.email,
          })),
          slices: offer.slices,
          totalPrice: result.totalPrice,
          currency: result.currency,
          status: "CONFIRMED",
        });

        return result;
      } catch (err) {
        wallet.balance += offer.totalPrice;
        await wallet.save();
        await Transaction.create({
          wallet: wallet._id,
          type: TRANSACTION_TYPE.REFUND,
          amount: offer.totalPrice,
          currency: offer.currency,
          status: "SUCCESS",
          reference: generateReference("RFD"),
          metadata: { direction: "credit", reason: "Duffel booking failed", originalReference: reference },
        });
        throw new GraphQLError("Flight booking failed and your wallet has been refunded.", {
          extensions: { code: "INTERNAL_SERVER_ERROR", cause: (err as Error).message },
        });
      }
    },
  },
};