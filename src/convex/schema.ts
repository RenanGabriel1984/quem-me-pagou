import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const categoryValidator = v.union(
  v.literal("video"),
  v.literal("musica"),
  v.literal("software"),
  v.literal("cursos"),
  v.literal("outro"),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // ── Quem me Pagou tables ──────────────────────────────────────
    subscriptions: defineTable({
      userId: v.string(),
      name: v.string(),
      category: categoryValidator,
      icon: v.string(),
      totalMonthly: v.number(),
      individualPrice: v.number(),
      startDate: v.string(),
      dueDay: v.number(),
    }).index("by_user", ["userId"]),

    people: defineTable({
      userId: v.string(),
      subscriptionId: v.id("subscriptions"),
      name: v.string(),
      phone: v.string(),
      amount: v.number(),
      paidThisMonth: v.boolean(),
      monthsPaid: v.number(),
      unpaidMonths: v.number(),
      lastPaymentDate: v.optional(v.string()),
    }).index("by_subscription", ["subscriptionId"])
      .index("by_user", ["userId"]),

    settings: defineTable({
      userId: v.string(),
      pixKey: v.string(),
      ownerName: v.string(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
