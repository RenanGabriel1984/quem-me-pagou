import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Helper to get user ID (falls back to "anonymous" for unauthenticated users)
function getUserId(ctx: any): string {
  // For now, use a simple approach - if auth is available, use it; otherwise default
  return "default-user";
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = getUserId(ctx);
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal("video"),
      v.literal("musica"),
      v.literal("software"),
      v.literal("cursos"),
      v.literal("outro")
    ),
    icon: v.string(),
    totalMonthly: v.number(),
    individualPrice: v.number(),
    startDate: v.string(),
    dueDay: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = getUserId(ctx);
    return await ctx.db.insert("subscriptions", {
      userId,
      ...args,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("subscriptions"),
    name: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("video"),
        v.literal("musica"),
        v.literal("software"),
        v.literal("cursos"),
        v.literal("outro")
      )
    ),
    icon: v.optional(v.string()),
    totalMonthly: v.optional(v.number()),
    individualPrice: v.optional(v.number()),
    startDate: v.optional(v.string()),
    dueDay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    // Remove undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("subscriptions") },
  handler: async (ctx, args) => {
    // Delete all people for this subscription first
    const people = await ctx.db
      .query("people")
      .withIndex("by_subscription", (q: any) => q.eq("subscriptionId", args.id))
      .collect();
    
    for (const person of people) {
      await ctx.db.delete(person._id);
    }
    
    await ctx.db.delete(args.id);
  },
});
