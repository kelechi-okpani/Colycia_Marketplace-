export interface PriceBreakdown {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  commissionAmount: number;
  totalAmount: number;
}

// Single source of truth for how a booking's price is computed, so the
// math can never drift between resolvers. commissionRate comes from the
// Provider document (defaults to 0.1 there).
export function computeBookingPrice(
  unitPrice: number,
  quantity: number,
  commissionRate: number
): PriceBreakdown {
  const subtotal = round2(unitPrice * quantity);
  const commissionAmount = round2(subtotal * commissionRate);
  const totalAmount = round2(subtotal + commissionAmount);

  return { unitPrice, quantity, subtotal, commissionAmount, totalAmount };
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
