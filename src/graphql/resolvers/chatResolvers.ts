import { GraphQLError } from "graphql";
import { Conversation } from "../../models/Conversation.js";
import { Message } from "../../models/Message.js";
import { Booking } from "../../models/Booking.js";
import { requireAuth } from "../../middleware/permissions.js";
import type { GraphQLContext } from "../../types/context.js";

export const chatResolvers = {
  Query: {
    myConversations: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      return Conversation.find({ participants: user.id }).sort({
        lastMessageAt: -1,
      });
    },

    conversationMessages: async (
      _: unknown,
      {
        conversationId,
        page = 1,
        pageSize = 30,
      }: { conversationId: string; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const convo = await Conversation.findById(conversationId);
      if (!convo || !convo.participants.map(String).includes(user.id)) {
        throw new GraphQLError("You are not part of this conversation.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      return Message.find({ conversation: conversationId })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: 1 });
    },
  },

  Mutation: {
    startConversation: async (
      _: unknown,
      { otherUserId, bookingId }: { otherUserId: string; bookingId?: string },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);

      let convo = await Conversation.findOne({
        participants: { $all: [user.id, otherUserId], $size: 2 },
      });

      if (!convo) {
        let isEnhancedPrivacy = false;
        if (bookingId) {
          const booking = await Booking.findById(bookingId);
          isEnhancedPrivacy = booking?.category === "PROFESSIONAL_THERAPY";
        }

        convo = await Conversation.create({
          participants: [user.id, otherUserId],
          relatedBooking: bookingId,
          isEnhancedPrivacy,
        });
      }

      return convo;
    },

    sendMessage: async (
      _: unknown,
      {
        conversationId,
        body,
        attachments,
      }: { conversationId: string; body: string; attachments?: string[] },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const convo = await Conversation.findById(conversationId);
      if (!convo || !convo.participants.map(String).includes(user.id)) {
        throw new GraphQLError("You are not part of this conversation.", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: user.id,
        body,
        attachments: attachments ?? [],
        readBy: [user.id],
      });

      convo.lastMessagePreview = body.slice(0, 140);
      convo.lastMessageAt = new Date();
      await convo.save();

      return message;
    },

    markConversationRead: async (
      _: unknown,
      { conversationId }: { conversationId: string },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      await Message.updateMany(
        { conversation: conversationId, readBy: { $ne: user.id } },
        { $addToSet: { readBy: user.id } }
      );
      return true;
    },
  },
};
