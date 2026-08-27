import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, requireUserId } from "./helpers";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) {
      return { pixKey: "", ownerName: "", whatsappTemplate: "" };
    }
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!settings) {
      return { pixKey: "", ownerName: "", whatsappTemplate: "" };
    }

    return {
      pixKey: settings.pixKey,
      ownerName: settings.ownerName,
      whatsappTemplate: settings.whatsappTemplate || "",
    };
  },
});

export const upsert = mutation({
  args: {
    pixKey: v.string(),
    ownerName: v.string(),
    whatsappTemplate: v.optional(v.string()),
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
        ...(args.whatsappTemplate !== undefined && { whatsappTemplate: args.whatsappTemplate }),
      });
    } else {
      await ctx.db.insert("settings", {
        userId,
        pixKey: args.pixKey,
        ownerName: args.ownerName,
        whatsappTemplate: args.whatsappTemplate || "",
      });
    }
  },
});
