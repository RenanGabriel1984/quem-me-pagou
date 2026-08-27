import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useCallback } from "react";
import type { Id } from "../convex/_generated/dataModel";

// Helper to compute months since a start date
function monthsSinceStart(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());
  return Math.max(0, months);
}

// Helper to compute total person savings
function totalPersonSavings(
  individualPrice: number,
  shareAmount: number,
  monthsPaid: number,
): number {
  const monthlySavings = Math.max(0, individualPrice - shareAmount);
  return monthlySavings * monthsPaid;
}

export function useStorage() {
  // Queries - these are reactive and will update in real-time
  const subscriptions = useQuery(api.subscriptions.list) ?? [];
  const settings = useQuery(api.settings.get) ?? { pixKey: "", ownerName: "" };
  
  // For each subscription, we need to fetch its people
  // We'll use a separate query for each subscription's people
  const getPeopleForSubscription = useCallback(
    (subscriptionId: Id<"subscriptions">) => {
      return useQuery(api.people.listBySubscription, { subscriptionId }) ?? [];
    },
    []
  );
  
  // Mutations
  const createSubscription = useMutation(api.subscriptions.create);
  const updateSubscription = useMutation(api.subscriptions.update);
  const deleteSubscription = useMutation(api.subscriptions.remove);
  
  const createPerson = useMutation(api.people.create);
  const updatePersonStatus = useMutation(api.people.updateStatus);
  const deletePerson = useMutation(api.people.remove);
  const resetAllMonthlyPayments = useMutation(api.people.resetAllMonthlyPayments);
  
  const upsertSettings = useMutation(api.settings.upsert);
  
  // Wrapper functions that match the old API
  const addSubscription = useCallback(
    async (sub: {
      name: string;
      category: string;
      icon: string;
      totalMonthly: number;
      individualPrice: number;
      startDate: string;
      dueDay: number;
      people: any[];
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
  
  const togglePersonStatus = useCallback(
    async (
      subscriptionId: Id<"subscriptions">,
      personId: Id<"people">,
      paid: boolean
    ) => {
      await updatePersonStatus({
        id: personId,
        paid,
      });
    },
    [updatePersonStatus]
  );
  
  const removePerson = useCallback(
    async (personId: Id<"people">) => {
      await deletePerson({ id: personId });
    },
    [deletePerson]
  );
  
  const updateSettings = useCallback(
    async (newSettings: { pixKey: string; ownerName: string }) => {
      await upsertSettings(newSettings);
    },
    [upsertSettings]
  );
  
  const resetMonthlyPayments = useCallback(async () => {
    await resetAllMonthlyPayments();
  }, [resetAllMonthlyPayments]);
  
  // Computed values
  const totalMonthly = subscriptions.reduce(
    (sum, s) => sum + s.totalMonthly,
    0
  );
  
  // We need to fetch people for each subscription to compute totals
  // This is done inline using the query hooks
  const subscriptionsWithPeople = subscriptions.map((sub) => {
    const people = useQuery(api.people.listBySubscription, { subscriptionId: sub._id }) ?? [];
    return { ...sub, people };
  });
  
  const totalPending = subscriptionsWithPeople.reduce((sum, s) => {
    return (
      sum +
      s.people
        .filter((p: any) => !p.paidThisMonth)
        .reduce((pSum: number, p: any) => pSum + p.amount, 0)
    );
  }, 0);
  
  const totalPaid = subscriptionsWithPeople.reduce((sum, s) => {
    return (
      sum +
      s.people
        .filter((p: any) => p.paidThisMonth)
        .reduce((pSum: number, p: any) => pSum + p.amount, 0)
    );
  }, 0);
  
  // Total accumulated savings
  const totalAccumulatedSavings = subscriptionsWithPeople.reduce(
    (sum, s) => {
      return (
        sum +
        s.people.reduce(
          (pSum: number, p: any) =>
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
  
  return {
    subscriptions,
    subscriptionsWithPeople,
    settings,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    addPerson,
    togglePersonStatus,
    removePerson,
    updateSettings,
    resetMonthlyPayments,
    totalMonthly,
    totalPending,
    totalPaid,
    totalAccumulatedSavings,
    getPersonSavings,
    getPeopleForSubscription,
  };
}
