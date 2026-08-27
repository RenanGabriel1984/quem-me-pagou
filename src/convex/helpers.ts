import { getAuthUserId } from "@convex-dev/auth/server";
import type { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Get the current authenticated user's ID.
 * Falls back to "anonymous" if not signed in (for public pages).
 */
export async function requireUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error("Not authenticated");
  }
  return userId as string;
}

/**
 * Get the current user's ID, returning null if not authenticated.
 */
export async function getUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
  const userId = await getAuthUserId(ctx);
  return userId ? (userId as string) : null;
}
