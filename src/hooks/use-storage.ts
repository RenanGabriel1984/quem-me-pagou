import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCallback, useMemo } from "react";
import type { Id } from "../convex/_generated/dataModel";

// Helper to compute total person savings
function totalPersonSavings(
  individualPrice: number,
  shareAmount: number,
  monthsPaid: number,
): number {
  const monthlySavings = Math.max(0, individualPrice - shareAmount);
  return monthlySavings * monthsPaid;
}

// Helper to get month name in Portuguese
function getMonthName(dateStr: string): string {
  const date = new Date(dateStr);
  const months = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return `${months[date.getMonth()]}/${date.getFullYear()}`;
}

// Helper to format currency
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function useStorage() {
  // Single query for all subscriptions
  const subscriptions = useQuery(api.subscriptions.list) ?? [];
  // Single query for ALL people (no more useQuery in loop!)
  const allPeople = useQuery(api.people.listAll) ?? [];
  // Settings
  const settings = useQuery(api.settings.get) ?? { pixKey: "", ownerName: "" };

  // Mutations
  const createSubscription = useMutation(api.subscriptions.create);
  const updateSubscription = useMutation(api.subscriptions.update);
  const deleteSubscription = useMutation(api.subscriptions.remove);

  const createPerson = useMutation(api.people.create);
  const updatePerson = useMutation(api.people.update);
  const updatePersonStatus = useMutation(api.people.updateStatus);
  const deletePerson = useMutation(api.people.remove);
  const resetMonthlyPaymentsMutation = useMutation(api.people.resetMonthlyPayments);

  const upsertSettings = useMutation(api.settings.upsert);

  // Group people by subscriptionId (client-side, no hooks in loop)
  const subscriptionsWithPeople = useMemo(() => {
    return subscriptions.map((sub) => {
      const people = allPeople.filter((p) => p.subscriptionId === sub._id);
      return { ...sub, people };
    });
  }, [subscriptions, allPeople]);

  // Wrapper: add subscription
  const addSubscription = useCallback(
    async (sub: {
      name: string;
      category: string;
      icon: string;
      totalMonthly: number;
      individualPrice: number;
      startDate: string;
      dueDay: number;
    }) => {
      await createSubscription({
        name: sub.name,
        category: sub.category as any,
        icon: sub.icon,
        totalMonthly: sub.totalMonthly,
        individualPrice: sub.individualPrice,
        startDate: sub.startDate,
        dueDay: sub.dueDay,
      });
    },
    [createSubscription]
  );

  // Wrapper: edit subscription
  const editSubscription = useCallback(
    async (
      id: Id<"subscriptions">,
      updates: {
        name?: string;
        category?: string;
        icon?: string;
        totalMonthly?: number;
        individualPrice?: number;
        startDate?: string;
        dueDay?: number;
      }
    ) => {
      await updateSubscription({
        id,
        ...updates,
        category: updates.category as any,
      });
    },
    [updateSubscription]
  );

  // Wrapper: remove subscription
  const removeSubscription = useCallback(
    async (id: Id<"subscriptions">) => {
      await deleteSubscription({ id });
    },
    [deleteSubscription]
  );

  // Wrapper: add person
  const addPerson = useCallback(
    async (
      subscriptionId: Id<"subscriptions">,
      person: {
        name: string;
        phone: string;
        amount: number;
      }
    ) => {
      await createPerson({
        subscriptionId,
        name: person.name,
        phone: person.phone,
        amount: person.amount,
      });
    },
    [createPerson]
  );

  // Wrapper: edit person
  const editPerson = useCallback(
    async (
      personId: Id<"people">,
      updates: {
        name?: string;
        phone?: string;
        amount?: number;
        proofNote?: string;
      }
    ) => {
      await updatePerson({ id: personId, ...updates });
    },
    [updatePerson]
  );

  // Wrapper: toggle person status
  const togglePersonStatus = useCallback(
    async (
      subscriptionId: Id<"subscriptions">,
      personId: Id<"people">,
      paid: boolean,
      proofNote?: string,
    ) => {
      await updatePersonStatus({
        id: personId,
        paid,
        proofNote: paid ? proofNote : undefined,
      });
    },
    [updatePersonStatus]
  );

  // Wrapper: remove person
  const removePerson = useCallback(
    async (personId: Id<"people">) => {
      await deletePerson({ id: personId });
    },
    [deletePerson]
  );

  // Wrapper: update settings
  const updateSettings = useCallback(
    async (newSettings: { pixKey: string; ownerName: string }) => {
      await upsertSettings(newSettings);
    },
    [upsertSettings]
  );

  // Wrapper: reset monthly
  const resetMonthlyPayments = useCallback(async () => {
    await resetMonthlyPaymentsMutation();
  }, [resetMonthlyPaymentsMutation]);

  // Computed values
  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum + s.totalMonthly,
    0
  );

  const totalPending = subscriptionsWithPeople.reduce((sum, s) => {
    return (
      sum +
      s.people
        .filter((p) => !p.paidThisMonth)
        .reduce((pSum, p) => pSum + (p.amount * (p.unpaidMonths || 1)), 0)
    );
  }, 0);

  const totalPaid = subscriptionsWithPeople.reduce((sum, s) => {
    return (
      sum +
      s.people
        .filter((p) => p.paidThisMonth)
        .reduce((pSum, p) => pSum + p.amount, 0)
    );
  }, 0);

  // Total accumulated savings
  const totalAccumulatedSavings = subscriptionsWithPeople.reduce(
    (sum, s) => {
      return (
        sum +
        s.people.reduce(
          (pSum, p) =>
            pSum + totalPersonSavings(s.individualPrice, p.amount, p.monthsPaid),
          0
        )
      );
    },
    0
  );

  // Helper: per-person savings
  const getPersonSavings = useCallback(
    (individualPrice: number, amount: number, monthsPaid: number) => {
      return totalPersonSavings(individualPrice, amount, monthsPaid);
    },
    []
  );

  // Helper: get total due for a person
  const getPersonTotalDue = useCallback(
    (amount: number, unpaidMonths: number) => {
      return amount * (unpaidMonths || 0);
    },
    []
  );

  // Helper: get start month text
  const getStartMonthText = useCallback(
    (startDate: string) => {
      return getMonthName(startDate);
    },
    []
  );

  // Helper: format currency
  const formatBRL = useCallback(
    (value: number) => {
      return formatCurrency(value);
    },
    []
  );

  return {
    subscriptions,
    subscriptionsWithPeople,
    allPeople,
    settings,
    addSubscription,
    editSubscription,
    removeSubscription,
    addPerson,
    editPerson,
    togglePersonStatus,
    removePerson,
    updateSettings,
    resetMonthlyPayments,
    totalMonthly,
    totalPending,
    totalPaid,
    totalAccumulatedSavings,
    getPersonSavings,
    getPersonTotalDue,
    getStartMonthText,
    formatBRL,
  };
}
