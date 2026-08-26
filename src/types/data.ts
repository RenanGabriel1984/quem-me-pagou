export type Category = "video" | "musica" | "software" | "cursos" | "outro";

export interface Person {
  id: string;
  name: string;
  phone: string; // WhatsApp number, digits only
  amount: number;
  paidThisMonth: boolean;
}

export interface Subscription {
  id: string;
  name: string;
  category: Category;
  icon: string; // emoji
  totalMonthly: number;
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
