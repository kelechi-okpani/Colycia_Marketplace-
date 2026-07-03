import { Schema } from "mongoose";
import { Listing, IListing } from "./Listing";
import { PROVIDER_CATEGORIES } from "../../config/constants";

// Flights are the one category where we rely on an external API
// (e.g. Amadeus, Duffel, Travelport) for live search/pricing/inventory
// rather than modeling seat inventory ourselves. This listing type
// mainly stores the provider's identity and booking metadata; actual
// flight search hits services/flightSearch.ts.
export interface IAirlineListing extends IListing {
  airlineCode?: string; // IATA code, e.g. "WL" for Overland Airways
  externalProvider: string; // which API integration to use
  hubAirports: string[];
}

export const AirlineListing = Listing.discriminator<IAirlineListing>(
  PROVIDER_CATEGORIES.AIRLINE,
  new Schema<IAirlineListing>({
    airlineCode: String,
    externalProvider: { type: String, default: "AMADEUS" },
    hubAirports: [String],
  })
);
