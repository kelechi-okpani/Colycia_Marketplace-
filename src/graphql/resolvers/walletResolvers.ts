import { GraphQLError } from "graphql";
import { Wallet } from "../../models/Wallet";
import { Transaction } from "../../models/Transaction";
import { requireAuth } from "../../middleware/permissions";
import { initializePayment, verifyPayment } from "../../services/paymentService";
import { markDepositSuccessful } from "../../services/walletService";
import { generateReference } from "../../utils/reference";
import { TRANSACTION_TYPE } from "../../config/constants";
import type { GraphQLContext } from "../../types/context";



export const walletResolvers = {
  Query: {
    myWallet: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      let wallet = await Wallet.findOne({ owner: user.id });
      if (!wallet) wallet = await Wallet.create({ owner: user.id }); // safety net for pre-existing accounts
      return wallet;
    },

    myTransactions: async (
      _: unknown,
      { page = 1, pageSize = 20 }: { page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const wallet = await Wallet.findOne({ owner: user.id });
      if (!wallet) return [];
      return Transaction.find({ wallet: wallet._id })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });
    },
  },

  Mutation: {
    initializeDeposit: async (_: unknown, { amount }: { amount: number }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      if (amount <= 0) throw new GraphQLError("Amount must be greater than zero.", { extensions: { code: "BAD_USER_INPUT" } });

      const wallet = await Wallet.findOne({ owner: user.id });
      if (!wallet) throw new GraphQLError("Wallet not found.", { extensions: { code: "NOT_FOUND" } });

      const reference = generateReference("DEP");

      const session = await initializePayment({
        email: user.email,
        amount,
        currency: wallet.currency,
        reference,
      });

      // providerSessionId is stashed in metadata so verifyDeposit and the
      // webhook handler can both look the Stripe session back up from our
      // own reference without a second round trip to Stripe.
      await Transaction.create({
        wallet: wallet._id,
        type: TRANSACTION_TYPE.DEPOSIT,
        amount,
        currency: wallet.currency,
        status: "PENDING",
        reference,
        metadata: { providerSessionId: session.providerSessionId },
      });

      return session;
    },

    verifyDeposit: async (_: unknown, { reference }: { reference: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);

      const txn = await Transaction.findOne({ reference });
      if (!txn) throw new GraphQLError("Transaction not found.", { extensions: { code: "NOT_FOUND" } });

      if (txn.status === "SUCCESS") return txn; // webhook may have already settled it

      const providerSessionId = (txn.metadata as { providerSessionId?: string } | undefined)?.providerSessionId;
      if (!providerSessionId) {
        throw new GraphQLError("This transaction has no associated payment session.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      const result = await verifyPayment(providerSessionId);
      if (result.success) {
        return markDepositSuccessful(reference);
      }

      return txn;
    },

    requestWithdrawal: async (_: unknown, { amount }: { amount: number }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const wallet = await Wallet.findOne({ owner: user.id });
      if (!wallet) throw new GraphQLError("Wallet not found.", { extensions: { code: "NOT_FOUND" } });
      if (wallet.balance < amount) {
        throw new GraphQLError("Insufficient balance.", { extensions: { code: "BAD_USER_INPUT" } });
      }

      const reference = generateReference("WD");
      const txn = await Transaction.create({
        wallet: wallet._id,
        type: TRANSACTION_TYPE.WITHDRAWAL,
        amount,
        status: "PENDING",
        reference,
      });

      wallet.balance -= amount;
      await wallet.save();

      // Real implementation: trigger a payout via Stripe Connect transfers
      // (requires providers to be onboarded as connected accounts).
      return txn;
    },
  },
};