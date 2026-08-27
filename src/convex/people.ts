import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listBySubscription = query({
  args: { subscriptionId: v.id("subscriptions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("people")
      .withIndex("by_subscription", (q: any) => q.eq("subscriptionId", args.subscriptionId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    subscriptionId: v.id("subscriptions"),
    name: v.string(),
    phone: v.string(),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = "default-user";
    return await ctx.db.insert("people", {
      userId,
      subscriptionId: args.subscriptionId,
      name: args.name,
      phone: args.phone,
      amount: args.amount,
      paidThisMonth: false,
      monthsPaid: 0,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("people"),
    paid: v.boolean(),
  },
  handler: async (ctx, args) => {
    const person = await ctx.db.get(args.id);
    if (!person) throw new Error("Person not found");
    
    await ctx.db.patch(args.id, {
      paidThisMonth: args.paid,
      // Only count transitions from unpaid → paid
      monthsPaid: args.paid && !person.paidThisMonth
        ? person.monthsPaid + 1
        : person.monthsPaid,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("people"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    amount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filteredUpdates);
  },
});

export const remove = mutation({
  args: { id: v.id("people") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const resetAllMonthlyPayments = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = "default-user";
    const allPeople = await ctx.db
      .query("people")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();
    
    for (const person of allPeople) {
      await ctx.db.patch(person._id, { paidThisMonth: false });
    }
  },
});
