import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, requireUserId } from "./helpers";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return { pixKey: "", ownerName: "" };
    }
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!settings) {
      return { pixKey: "", ownerName: "" };
    }

    return {
      pixKey: settings.pixKey,
      ownerName: settings.ownerName,
    };
  },
});

export const upsert = mutation({
  args: {
    pixKey: v.string(),
    ownerName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await requireUserId(ctx);
    const existing = await ctx.db
      .query("settings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        pixKey: args.pixKey,
        ownerName: args.ownerName,
      });
    } else {
      await ctx.db.insert("settings", {
        userId,
        pixKey: args.pixKey,
        ownerName: args.ownerName,
      });
    }
  },
});
