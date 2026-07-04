import { env } from "../config/env";

export interface PayoutRecipientInput {
  accountNumber: string;
  bankCode: string; // Paystack bank code, e.g. "058" for GTBank
  accountName: string;
}

export interface PayoutResult {
  success: boolean;
  transferCode: string;
  reference: string;
}

// Stripe cannot pay out to Nigerian bank accounts (no Connect support for
// NG-based recipients), so provider withdrawals go out through Paystack
// Transfers instead — customer money comes IN via Stripe, provider money
// goes OUT via Paystack. Two rails, one wallet ledger in between.
//
// Real implementation:
//   1. POST https://api.paystack.co/transferrecipient  (create recipient once, cache recipient_code on Provider)
//   2. POST https://api.paystack.co/transfer            (initiate the transfer)
// Both need Authorization: Bearer ${PAYSTACK_SECRET_KEY}
export async function initiateProviderPayout(
  recipient: PayoutRecipientInput,
  amountNaira: number,
  reference: string
): Promise<PayoutResult> {
  if (!env.PAYSTACK_SECRET_KEY) {
    console.warn("[payouts] PAYSTACK_SECRET_KEY not set — returning mock payout result");
  }

  console.log(
    `[payouts] (stub) transferring ₦${amountNaira} to ${recipient.accountName} (${recipient.accountNumber}) ref=${reference}`
  );

  return { success: true, transferCode: `mock_transfer_${reference}`, reference };
}