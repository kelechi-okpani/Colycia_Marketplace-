import { env } from "../config/env";

// Duffel is a plain JSON REST API — no SDK needed, which keeps this
// dependency-free. Docs: https://duffel.com/docs/api/overview/welcome
// Self-serve signup, no travel-agency accreditation required, 300+
// airlines via NDC + GDS + low-cost-carrier content in one integration.
const DUFFEL_BASE_URL = "https://api.duffel.com";
const DUFFEL_VERSION = "v2";

function duffelHeaders() {
  if (!env.DUFFEL_API_KEY) {
    console.warn("[flights] DUFFEL_API_KEY not set — flight search/booking calls will fail until it is.");
  }
  return {
    Authorization: `Bearer ${env.DUFFEL_API_KEY}`,
    "Duffel-Version": DUFFEL_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export interface FlightSearchInput {
  origin: string; // IATA airport or city code, e.g. "LOS", "LHR"
  destination: string;
  departureDate: string; // ISO date, "2026-08-14"
  returnDate?: string; // omit for one-way
  passengers: number;
  cabinClass?: "economy" | "premium_economy" | "business" | "first";
}

export interface FlightSegment {
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  originAirport: string;
  destinationAirport: string;
}

export interface FlightOption {
  offerId: string; // pass this straight into bookFlight
  totalPrice: number;
  currency: string;
  expiresAt: string; // offers go stale — re-fetch/re-validate after this
  slices: FlightSegment[][]; // one array per leg (outbound, [return])
}

// Creates a Duffel "offer request" (their term for a flight search) and
// returns the resulting offers. Offer requests also implicitly create a
// short-lived "offer" per result — offerId below is what you pass to
// bookFlight once the customer picks one.
export async function searchFlights(input: FlightSearchInput): Promise<FlightOption[]> {
  const slices = [{ origin: input.origin, destination: input.destination, departure_date: input.departureDate }];
  if (input.returnDate) {
    slices.push({ origin: input.destination, destination: input.origin, departure_date: input.returnDate });
  }

  const res = await fetch(`${DUFFEL_BASE_URL}/air/offer_requests?return_offers=true`, {
    method: "POST",
    headers: duffelHeaders(),
    body: JSON.stringify({
      data: {
        slices,
        passengers: Array.from({ length: input.passengers }, () => ({ type: "adult" })),
        cabin_class: input.cabinClass ?? "economy",
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Duffel offer request failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { data: { offers: DuffelOffer[] } };
  return json.data.offers.map(mapDuffelOffer);
}

// Offers go stale quickly and can no longer be booked once expired. Call
// this right before charging the customer to get the authoritative,
// up-to-date price — never trust a price the client cached from search.
export async function getOffer(offerId: string): Promise<FlightOption> {
  const res = await fetch(`${DUFFEL_BASE_URL}/air/offers/${offerId}`, {
    method: "GET",
    headers: duffelHeaders(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Duffel get-offer failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { data: DuffelOffer };
  return mapDuffelOffer(json.data);
}

export interface BookFlightInput {
  offerId: string;
  passengers: {
    title: "mr" | "ms" | "mrs" | "miss";
    givenName: string;
    familyName: string;
    email: string;
    phoneNumber: string;
    born: string; // ISO date
    gender: "m" | "f";
  }[];
}

export interface BookFlightResult {
  orderId: string;
  bookingReference: string; // airline PNR — the code the customer uses on the airline's own site
  totalPrice: number;
  currency: string;
}

// Creates an actual paid order with the airline. In production you charge
// the customer (via Stripe, same as any other booking) BEFORE calling
// this — Duffel does not hold funds on your behalf unless you've set up
// Duffel Payments/Balance separately.
export async function bookFlight(input: BookFlightInput): Promise<BookFlightResult> {
  const res = await fetch(`${DUFFEL_BASE_URL}/air/orders`, {
    method: "POST",
    headers: duffelHeaders(),
    body: JSON.stringify({
      data: {
        type: "instant",
        selected_offers: [input.offerId],
        passengers: input.passengers.map((p) => ({
          title: p.title,
          given_name: p.givenName,
          family_name: p.familyName,
          email: p.email,
          phone_number: p.phoneNumber,
          born_on: p.born,
          gender: p.gender,
        })),
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Duffel order creation failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { data: DuffelOrder };
  return {
    orderId: json.data.id,
    bookingReference: json.data.booking_reference,
    totalPrice: Number(json.data.total_amount),
    currency: json.data.total_currency,
  };
}

// --- Internal Duffel response shapes (only the fields we use) ---

interface DuffelOffer {
  id: string;
  total_amount: string;
  total_currency: string;
  expires_at: string;
  slices: {
    segments: {
      operating_carrier: { iata_code: string; name: string };
      operating_carrier_flight_number: string;
      departing_at: string;
      arriving_at: string;
      origin: { iata_code: string };
      destination: { iata_code: string };
    }[];
  }[];
}

interface DuffelOrder {
  id: string;
  booking_reference: string;
  total_amount: string;
  total_currency: string;
}

function mapDuffelOffer(offer: DuffelOffer): FlightOption {
  return {
    offerId: offer.id,
    totalPrice: Number(offer.total_amount),
    currency: offer.total_currency,
    expiresAt: offer.expires_at,
    slices: offer.slices.map((slice) =>
      slice.segments.map((seg) => ({
        airlineCode: seg.operating_carrier.iata_code,
        airlineName: seg.operating_carrier.name,
        flightNumber: seg.operating_carrier_flight_number,
        departureTime: seg.departing_at,
        arrivalTime: seg.arriving_at,
        originAirport: seg.origin.iata_code,
        destinationAirport: seg.destination.iata_code,
      }))
    ),
  };
}
