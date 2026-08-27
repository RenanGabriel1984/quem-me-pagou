import { api } from "./_generated/api";
import { action, query } from "./_generated/server";
import { getUserId } from "./helpers";

export const hasData = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getUserId(ctx);
    if (!userId) return false;
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();
    return sub !== null;
  },
});

export const seedAll = action({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.runQuery(api.seed.hasData);
    if (existing) return { message: "Database already seeded" };

    // --- Subscriptions ---
    const netflixId = await ctx.runMutation(api.subscriptions.create, {
      name: "Netflix",
      category: "video",
      icon: "🎬",
      totalMonthly: 55.90,
      individualPrice: 55.90,
      startDate: "2024-06-01",
      dueDay: 15,
    });

    const spotifyId = await ctx.runMutation(api.subscriptions.create, {
      name: "Spotify Premium",
      category: "musica",
      icon: "🎵",
      totalMonthly: 34.90,
      individualPrice: 34.90,
      startDate: "2024-03-01",
      dueDay: 20,
    });

    const chatgptId = await ctx.runMutation(api.subscriptions.create, {
      name: "ChatGPT Plus",
      category: "software",
      icon: "🤖",
      totalMonthly: 120.00,
      individualPrice: 120.00,
      startDate: "2024-09-01",
      dueDay: 10,
    });

    const udemyId = await ctx.runMutation(api.subscriptions.create, {
      name: "Udemy Business",
      category: "cursos",
      icon: "📚",
      totalMonthly: 89.90,
      individualPrice: 89.90,
      startDate: "2025-01-01",
      dueDay: 5,
    });

    // --- People for Netflix ---
    await ctx.runMutation(api.people.create, {
      subscriptionId: netflixId,
      name: "João Silva",
      phone: "11999887766",
      amount: 18.63,
      paidThisMonth: true,
      monthsPaid: 10,
      unpaidMonths: 0,
      lastPaymentDate: "2025-08-15",
      proofNote: "Pago via Pix dia 15/08",
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: netflixId,
      name: "Maria Santos",
      phone: "11988776655",
      amount: 18.63,
      paidThisMonth: true,
      monthsPaid: 10,
      unpaidMonths: 0,
      lastPaymentDate: "2025-08-12",
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: netflixId,
      name: "Pedro Costa",
      phone: "11977665544",
      amount: 18.64,
      paidThisMonth: false,
      monthsPaid: 8,
      unpaidMonths: 2,
      lastPaymentDate: "2025-06-10",
      proofNote: "Deixou troco pra próxima",
    });

    // --- People for Spotify ---
    await ctx.runMutation(api.people.create, {
      subscriptionId: spotifyId,
      name: "Ana Oliveira",
      phone: "11966554433",
      amount: 11.63,
      paidThisMonth: true,
      monthsPaid: 12,
      unpaidMonths: 0,
      lastPaymentDate: "2025-08-18",
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: spotifyId,
      name: "Lucas Ferreira",
      phone: "11955443322",
      amount: 11.63,
      paidThisMonth: false,
      monthsPaid: 10,
      unpaidMonths: 1,
      lastPaymentDate: "2025-07-20",
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: spotifyId,
      name: "Carla Mendes",
      phone: "11944332211",
      amount: 11.64,
      paidThisMonth: true,
      monthsPaid: 11,
      unpaidMonths: 0,
      lastPaymentDate: "2025-08-14",
    });

    // --- People for ChatGPT Plus ---
    await ctx.runMutation(api.people.create, {
      subscriptionId: chatgptId,
      name: "Roberto Almeida",
      phone: "11933221100",
      amount: 40.00,
      paidThisMonth: true,
      monthsPaid: 8,
      unpaidMonths: 0,
      lastPaymentDate: "2025-08-08",
      proofNote: "Comprovante enviado no grupo",
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: chatgptId,
      name: "Juliana Lima",
      phone: "11922110099",
      amount: 40.00,
      paidThisMonth: false,
      monthsPaid: 6,
      unpaidMonths: 2,
      lastPaymentDate: "2025-06-10",
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: chatgptId,
      name: "Fernando Rocha",
      phone: "11911009988",
      amount: 40.00,
      paidThisMonth: true,
      monthsPaid: 7,
      unpaidMonths: 0,
      lastPaymentDate: "2025-08-05",
    });

    // --- People for Udemy ---
    await ctx.runMutation(api.people.create, {
      subscriptionId: udemyId,
      name: "Camila Souza",
      phone: "11900998877",
      amount: 29.97,
      paidThisMonth: true,
      monthsPaid: 6,
      unpaidMonths: 0,
      lastPaymentDate: "2025-08-03",
    });
    await ctx.runMutation(api.people.create, {
      subscriptionId: udemyId,
      name: "Marcos Pereira",
      phone: "11900887766",
      amount: 29.97,
      paidThisMonth: true,
      monthsPaid: 6,
      unpaidMonths: 0,
      lastPaymentDate: "2025-08-01",
    });

    return { message: "Database seeded successfully" };
  },
});
