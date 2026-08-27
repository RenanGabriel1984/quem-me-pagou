export type Category = "video" | "musica" | "software" | "cursos" | "outro";

export interface Person {
  id: string;
  name: string;
  phone: string; // WhatsApp number, digits only
  amount: number; // share amount the person pays monthly
  paidThisMonth: boolean;
  monthsPaid: number; // total months paid since subscription start
}

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  icon: string; // emoji
  totalMonthly: number; // what the group pays total
  individualPrice: number; // estimated price if bought alone
  startDate: string; // ISO date string (YYYY-MM-DD)
  dueDay: number; // day of month
  people: Person[];
}

export interface AppSettings {
  pixKey: string;
  ownerName: string;
}

export interface AppState {
  subscriptions: Subscription[];
  settings: AppSettings;
}

// --- Savings helpers ---

/** How many complete months have passed since the subscription started. */
export function monthsSinceStart(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(0, months);
}

/** Monthly savings for one person = individualPrice − their share. */
export function monthlySavings(
  individualPrice: number,
  shareAmount: number,
): number {
  return Math.max(0, individualPrice - shareAmount);
}

/**
 * Total savings for one person over the subscription lifetime.
 * Uses monthsSinceStart(subscriptionStartDate) to calculate retroactive
 * savings even when monthsPaid hasn't been updated yet.
 */
export function totalPersonSavings(
  individualPrice: number,
  shareAmount: number,
  monthsPaid: number,
  startDate?: string,
): number {
  const effectiveMonths = startDate
    ? Math.max(monthsPaid || 0, monthsSinceStart(startDate))
    : monthsPaid || 0;
  return monthlySavings(individualPrice, shareAmount) * effectiveMonths;
}

/** Total savings for the whole group (all people combined). */
export function totalGroupSavings(sub: Subscription): number {
  return sub.people.reduce(
    (sum, p) =>
      sum + totalPersonSavings(sub.individualPrice, p.amount, p.monthsPaid, sub.startDate),
    0,
  );
}

/** Month/year label for display, e.g. "jan/2025" */
export function formatStartMonth(startDate: string): string {
  return new Date(startDate).toLocaleDateString("pt-BR", {
    month: "short",
    year: "numeric",
  });
}

/** Format date for display, e.g. "15 de agosto de 2026" */
export function formatDateBR(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/** Default WhatsApp message template */
export const DEFAULT_WHATSAPP_TEMPLATE = `Fala {nome}! 🍿

Passando para lembrar da sua cota do *{assinatura}*.

{pendencia}💰 Valor: *{valor}*
🔑 Pix: *{chave_pix}*
📅 Vencimento: *{data_vencimento}*

💡 {economia}`;
