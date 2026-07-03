export interface FlightSearchInput {
  origin: string; // IATA code
  destination: string;
  departureDate: string; // ISO date
  returnDate?: string;
  passengers: number;
}

export interface FlightOption {
  airlineCode: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  seatsAvailable: number;
}

// Flights are the one vertical explicitly designed around an external
// API rather than internal inventory (see AirlineListing.externalProvider).
// Swap this stub for a real Amadeus/Duffel/Travelport client call.
export async function searchFlights(input: FlightSearchInput): Promise<FlightOption[]> {
  console.warn("[flights] Using mock flight search — connect Amadeus/Duffel here");
  return [
    {
      airlineCode: "WL",
      flightNumber: "WL102",
      departureTime: `${input.departureDate}T08:00:00Z`,
      arrivalTime: `${input.departureDate}T09:15:00Z`,
      price: 65000,
      currency: "NGN",
      seatsAvailable: 12,
    },
  ];
}
