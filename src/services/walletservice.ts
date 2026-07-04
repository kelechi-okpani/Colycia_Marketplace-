import { Transaction, ITransaction } from "../models/Transaction";
import { Wallet } from "../models/Wallet";
import { Provider } from "../models/Provider";
import { TRANSACTION_TYPE } from "../config/constants";
import { generateReference } from "../utils/reference";
import type { IBooking } from "../models/Booking";

// Single place that actually credits a wallet on a successful deposit,
// so the Stripe webhook (source of truth) and the manual verifyDeposit
// fallback can't double-credit or drift out of sync.
export async function markDepositSuccessful(reference: string): Promise<ITransaction | null> {
  const txn = await Transaction.findOne({ reference });
  if (!txn) return null;

  if (txn.status === "SUCCESS") return txn; // already credited — idempotent

  txn.status = "SUCCESS";
  await txn.save();

  await Wallet.findByIdAndUpdate(txn.wallet, { $inc: { balance: txn.amount } });

  return txn;
}

export async function markDepositFailed(reference: string): Promise<ITransaction | null> {
  const txn = await Transaction.findOne({ reference });
  if (!txn) return null;
  if (txn.status === "SUCCESS") return txn; // never downgrade a completed deposit

  txn.status = "FAILED";
  await txn.save();
  return txn;
}

// The other half of the money flow: when a booking is marked COMPLETED,
// the provider earns (subtotal), the platform keeps (commissionAmount).
// This is the function that was MISSING before — completeBooking now
// calls this, so providers actually see funds land in their wallet.
// Idempotent: checks for an existing PAYMENT transaction tied to this
// booking so a retried mutation call can never double-pay a provider.
export async function creditProviderForBooking(booking: IBooking): Promise<ITransaction> {
  const existing = await Transaction.findOne({
    relatedBooking: booking._id,
    type: TRANSACTION_TYPE.PAYMENT,
  });
  if (existing) return existing;

  const provider = await Provider.findById(booking.provider);
  if (!provider) throw new Error(`Provider ${booking.provider} not found while crediting booking ${booking._id}`);

  let wallet = await Wallet.findOne({ owner: provider.user });
  if (!wallet) wallet = await Wallet.create({ owner: provider.user, currency: booking.currency });

  const reference = generateReference("PAY");
  const txn = await Transaction.create({
    wallet: wallet._id,
    type: TRANSACTION_TYPE.PAYMENT,
    amount: booking.subtotal, // provider earns subtotal; commissionAmount stays with the platform
    currency: booking.currency,
    status: "SUCCESS",
    relatedBooking: booking._id,
    reference,
  });

  wallet.balance += booking.subtotal;
  await wallet.save();

  return txn;
}