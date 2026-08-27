import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = "default-user";
    const settings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();
    
    // Return default settings if none exist
    if (!settings) {
      return {
        pixKey: "",
        ownerName: "",
      };
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
    const userId = "default-user";
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
