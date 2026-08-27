import { action, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Check if data already exists
export const hasData = query({
  args: {},
  handler: async (ctx) => {
    const count = await ctx.db.query("subscriptions").collect();
    return count.length > 0;
  },
});

// Seed all mock data
export const seedAll = action({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.runQuery(api.seed.hasData);
    if (existing) {
      return { message: "Data already exists", seeded: false };
    }
    
    // Seed settings
    await ctx.runMutation(api.settings.upsert, {
      pixKey: "email@exemplo.com.br",
      ownerName: "Carlos",
    });
    
    // Seed Netflix
    const netflixId = await ctx.runMutation(api.subscriptions.create, {
      name: "Netflix",
      category: "video",
      icon: "🎬",
      totalMonthly: 55.90,
      individualPrice: 62.90,
      startDate: "2025-01-15",
      dueDay: 15,
    });
    
    await ctx.runMutation(api.people.create, {
      subscriptionId: netflixId,
      name: "Carlos",
      phone: "11999887766",
      amount: 18.63,
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: netflixId,
      name: "Ana",
      phone: "11988776655",
      amount: 18.63,
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: netflixId,
      name: "Pedro",
      phone: "11977665544",
      amount: 18.64,
    });
    
    // Seed Spotify
    const spotifyId = await ctx.runMutation(api.subscriptions.create, {
      name: "Spotify Premium",
      category: "musica",
      icon: "🎵",
      totalMonthly: 34.90,
      individualPrice: 21.90,
      startDate: "2025-03-10",
      dueDay: 10,
    });
    
    await ctx.runMutation(api.people.create, {
      subscriptionId: spotifyId,
      name: "Carlos",
      phone: "11999887766",
      amount: 17.45,
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: spotifyId,
      name: "Julia",
      phone: "11966554433",
      amount: 17.45,
    });
    
    // Seed ChatGPT Plus
    const chatgptId = await ctx.runMutation(api.subscriptions.create, {
      name: "ChatGPT Plus",
      category: "software",
      icon: "🤖",
      totalMonthly: 115.00,
      individualPrice: 130.00,
      startDate: "2024-11-05",
      dueDay: 5,
    });
    
    await ctx.runMutation(api.people.create, {
      subscriptionId: chatgptId,
      name: "Carlos",
      phone: "11999887766",
      amount: 28.75,
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: chatgptId,
      name: "Bruno",
      phone: "11955443322",
      amount: 28.75,
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: chatgptId,
      name: "Marina",
      phone: "11944332211",
      amount: 28.75,
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: chatgptId,
      name: "Rafael",
      phone: "11933221100",
      amount: 28.75,
    });
    
    // Seed Udemy
    const udemyId = await ctx.runMutation(api.subscriptions.create, {
      name: "Udemy Business",
      category: "cursos",
      icon: "📚",
      totalMonthly: 89.00,
      individualPrice: 89.00,
      startDate: "2025-06-20",
      dueDay: 20,
    });
    
    await ctx.runMutation(api.people.create, {
      subscriptionId: udemyId,
      name: "Carlos",
      phone: "11999887766",
      amount: 44.50,
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: udemyId,
      name: "Fernanda",
      phone: "11922110099",
      amount: 44.50,
    });
    
    return { message: "Mock data seeded successfully", seeded: true };
  },
});
