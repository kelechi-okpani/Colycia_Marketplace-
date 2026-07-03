import { GraphQLError } from "graphql";
import { Notification } from "../../models/Notification";
import { requireAuth } from "../../middleware/permissions";
import type { GraphQLContext } from "../../types/context";

export const notificationResolvers = {
  Query: {
    myNotifications: async (
      _: unknown,
      { unreadOnly, page = 1, pageSize = 20 }: { unreadOnly?: boolean; page?: number; pageSize?: number },
      ctx: GraphQLContext
    ) => {
      const user = requireAuth(ctx);
      const filter: Record<string, unknown> = { user: user.id };
      if (unreadOnly) filter.isRead = false;

      return Notification.find(filter)
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });
    },
  },

  Mutation: {
    markNotificationRead: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      const notification = await Notification.findOneAndUpdate(
        { _id: id, user: user.id },
        { isRead: true },
        { new: true }
      );
      if (!notification) throw new GraphQLError("Notification not found.", { extensions: { code: "NOT_FOUND" } });
      return notification;
    },

    markAllNotificationsRead: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      const user = requireAuth(ctx);
      await Notification.updateMany({ user: user.id, isRead: false }, { isRead: true });
      return true;
    },
  },
};
