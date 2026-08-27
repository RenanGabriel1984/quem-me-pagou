import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Restore all data from a backup. Clears existing data first.
 */
export const restoreAll = mutation({
  args: {
    subscriptions: v.array(
      v.object({
        _id: v.string(),
        name: v.string(),
        category: v.string(),
        icon: v.string(),
        totalMonthly: v.number(),
        individualPrice: v.number(),
        startDate: v.string(),
        dueDay: v.number(),
      }),
    ),
    people: v.array(
      v.object({
        subscriptionIndex: v.number(),
        name: v.string(),
        phone: v.string(),
        amount: v.number(),
        paidThisMonth: v.boolean(),
        monthsPaid: v.number(),
        unpaidMonths: v.number(),
        lastPaymentDate: v.optional(v.string()),
        proofNote: v.optional(v.string()),
      }),
    ),
    settings: v.object({
      pixKey: v.string(),
      ownerName: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = "default-user";

    // Delete all existing data
    const existingSubs = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .collect();

    for (const sub of existingSubs) {
      // Delete people first
      const people = await ctx.db
        .query("people")
        .withIndex("by_subscription", (q: any) => q.eq("subscriptionId", sub._id))
        .collect();
      for (const person of people) {
        await ctx.db.delete(person._id);
      }
      await ctx.db.delete(sub._id);
    }

    // Delete existing settings
    const existingSettings = await ctx.db
      .query("settings")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();
    if (existingSettings) {
      await ctx.db.delete(existingSettings._id);
    }

    // Insert new data — build a mapping from old _id to new _id
    const idMap: Record<string, string> = {};

    for (const sub of args.subscriptions) {
      const newId = await ctx.db.insert("subscriptions", {
        userId,
        name: sub.name,
        category: sub.category as any,
        icon: sub.icon,
        totalMonthly: sub.totalMonthly,
        individualPrice: sub.individualPrice,
        startDate: sub.startDate,
        dueDay: sub.dueDay,
      });
      idMap[sub._id] = newId;
    }

    // Insert people with mapped subscription IDs
    for (const person of args.people) {
      const oldSubId = args.subscriptions[person.subscriptionIndex]?._id;
      const newSubId = oldSubId ? idMap[oldSubId] : undefined;

      if (newSubId) {
        await ctx.db.insert("people", {
          userId,
          subscriptionId: newSubId as any,
          name: person.name,
          phone: person.phone,
          amount: person.amount,
          paidThisMonth: person.paidThisMonth,
          monthsPaid: person.monthsPaid,
          unpaidMonths: person.unpaidMonths,
          lastPaymentDate: person.lastPaymentDate,
          proofNote: person.proofNote,
        });
      }
    }

    // Insert settings
    await ctx.db.insert("settings", {
      userId,
      pixKey: args.settings.pixKey,
      ownerName: args.settings.ownerName,
    });

    return { message: "Dados restaurados com sucesso!" };
  },
});
