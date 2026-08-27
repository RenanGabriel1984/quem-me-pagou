import { useState, useCallback } from "react";
import type {
  AppState,
  Subscription,
  Person,
  AppSettings,
  Category,
} from "@/types/data";
import {
  monthsSinceStart,
  totalGroupSavings,
  totalPersonSavings,
} from "@/types/data";

const STORAGE_KEY = "quem-me-pagou-data";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getDefaultData(): AppState {
  return {
    settings: {
      pixKey: "email@exemplo.com.br",
      ownerName: "Carlos",
    },
    subscriptions: [
      {
        id: "sub-1",
        name: "Netflix",
        category: "video" as Category,
        icon: "🎬",
        totalMonthly: 55.90,
        individualPrice: 62.90,
        startDate: "2025-01-15",
        dueDay: 15,
        people: [
          { id: "p1", name: "Carlos", phone: "11999887766", amount: 18.63, paidThisMonth: true, monthsPaid: 7 },
          { id: "p2", name: "Ana", phone: "11988776655", amount: 18.63, paidThisMonth: true, monthsPaid: 5 },
          { id: "p3", name: "Pedro", phone: "11977665544", amount: 18.64, paidThisMonth: false, monthsPaid: 3 },
        ],
      },
      {
        id: "sub-2",
        name: "Spotify Premium",
        category: "musica" as Category,
        icon: "🎵",
        totalMonthly: 34.90,
        individualPrice: 21.90,
        startDate: "2025-03-10",
        dueDay: 10,
        people: [
          { id: "p4", name: "Carlos", phone: "11999887766", amount: 17.45, paidThisMonth: true, monthsPaid: 5 },
          { id: "p5", name: "Julia", phone: "11966554433", amount: 17.45, paidThisMonth: false, monthsPaid: 4 },
        ],
      },
      {
        id: "sub-3",
        name: "ChatGPT Plus",
        category: "software" as Category,
        icon: "🤖",
        totalMonthly: 115.00,
        individualPrice: 130.00,
        startDate: "2024-11-05",
        dueDay: 5,
        people: [
          { id: "p6", name: "Carlos", phone: "11999887766", amount: 28.75, paidThisMonth: true, monthsPaid: 9 },
          { id: "p7", name: "Bruno", phone: "11955443322", amount: 28.75, paidThisMonth: true, monthsPaid: 8 },
          { id: "p8", name: "Marina", phone: "11944332211", amount: 28.75, paidThisMonth: true, monthsPaid: 6 },
          { id: "p9", name: "Rafael", phone: "11933221100", amount: 28.75, paidThisMonth: false, monthsPaid: 2 },
        ],
      },
      {
        id: "sub-4",
        name: "Udemy Business",
        category: "cursos" as Category,
        icon: "📚",
        totalMonthly: 89.00,
        individualPrice: 89.00,
        startDate: "2025-06-20",
        dueDay: 20,
        people: [
          { id: "p10", name: "Carlos", phone: "11999887766", amount: 44.50, paidThisMonth: true, monthsPaid: 2 },
          { id: "p11", name: "Fernanda", phone: "11922110099", amount: 44.50, paidThisMonth: false, monthsPaid: 1 },
        ],
      },
    ],
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw) as AppState;
    }
  } catch {
    // ignore
  }
  return getDefaultData();
}

function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useStorage() {
  const [state, setState] = useState<AppState>(loadState);

  const persist = useCallback((next: AppState) => {
    setState(next);
    saveState(next);
  }, []);

  const updateSettings = useCallback(
    (settings: AppSettings) => {
      persist({ ...state, settings });
    },
    [state, persist],
  );

  const addSubscription = useCallback(
    (sub: Omit<Subscription, "id">) => {
      persist({
        ...state,
        subscriptions: [...state.subscriptions, { ...sub, id: generateId() }],
      });
    },
    [state, persist],
  );

  const updateSubscription = useCallback(
    (id: string, updates: Partial<Omit<Subscription, "id">>) => {
      persist({
        ...state,
        subscriptions: state.subscriptions.map((s) =>
          s.id === id ? { ...s, ...updates } : s,
        ),
      });
    },
    [state, persist],
  );

  const deleteSubscription = useCallback(
    (id: string) => {
      persist({
        ...state,
        subscriptions: state.subscriptions.filter((s) => s.id !== id),
      });
    },
    [state, persist],
  );

  const addPerson = useCallback(
    (
      subscriptionId: string,
      person: Omit<Person, "id" | "paidThisMonth" | "monthsPaid">,
    ) => {
      const newPerson: Person = {
        ...person,
        id: generateId(),
        paidThisMonth: false,
        monthsPaid: 0,
      };
      persist({
        ...state,
        subscriptions: state.subscriptions.map((s) =>
          s.id === subscriptionId
            ? { ...s, people: [...s.people, newPerson] }
            : s,
        ),
      });
    },
    [state, persist],
  );

  const updatePersonStatus = useCallback(
    (subscriptionId: string, personId: string, paid: boolean) => {
      persist({
        ...state,
        subscriptions: state.subscriptions.map((s) =>
          s.id === subscriptionId
            ? {
                ...s,
                people: s.people.map((p) =>
                  p.id === personId
                    ? {
                        ...p,
                        paidThisMonth: paid,
                        // Only count transitions from unpaid → paid
                        monthsPaid: paid && !p.paidThisMonth
                          ? p.monthsPaid + 1
                          : p.monthsPaid,
                      }
                    : p,
                ),
              }
            : s,
        ),
      });
    },
    [state, persist],
  );

  const deletePerson = useCallback(
    (subscriptionId: string, personId: string) => {
      persist({
        ...state,
        subscriptions: state.subscriptions.map((s) =>
          s.id === subscriptionId
            ? { ...s, people: s.people.filter((p) => p.id !== personId) }
            : s,
        ),
      });
    },
    [state, persist],
  );

  const resetMonthlyPayments = useCallback(() => {
    persist({
      ...state,
      subscriptions: state.subscriptions.map((s) => ({
        ...s,
        people: s.people.map((p) => ({ ...p, paidThisMonth: false })),
      })),
    });
  }, [state, persist]);

  // ── Computed values ──────────────────────────────────────────────

  const totalMonthly = state.subscriptions.reduce(
    (sum, s) => sum + s.totalMonthly,
    0,
  );

  const totalPending = state.subscriptions.reduce((sum, s) => {
    return (
      sum +
      s.people
        .filter((p) => !p.paidThisMonth)
        .reduce((pSum, p) => pSum + p.amount, 0)
    );
  }, 0);

  const totalPaid = state.subscriptions.reduce((sum, s) => {
    return (
      sum +
      s.people
        .filter((p) => p.paidThisMonth)
        .reduce((pSum, p) => pSum + p.amount, 0)
    );
  }, 0);

  // Total accumulated savings across all subscriptions and all people
  const totalAccumulatedSavings = state.subscriptions.reduce(
    (sum, s) => sum + totalGroupSavings(s),
    0,
  );

  // Helper: per-person savings for a subscription
  function getPersonSavings(sub: Subscription, person: Person): number {
    return totalPersonSavings(sub.individualPrice, person.amount, person.monthsPaid);
  }

  return {
    state,
    updateSettings,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    addPerson,
    updatePersonStatus,
    deletePerson,
    resetMonthlyPayments,
    totalMonthly,
    totalPending,
    totalPaid,
    totalAccumulatedSavings,
    getPersonSavings,
  };
}
