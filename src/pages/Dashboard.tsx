import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStorage } from "@/hooks/use-storage";
import type { Category } from "@/types/data";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  X,
  Check,
  DollarSign,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router";
import { api } from "../convex/_generated/api";
import { useMutation, useAction } from "convex/react";
import { AppHeader } from "@/components/AppHeader";
import { PWAInstallBanner } from "@/components/PWAInstallBanner";
import { DashboardSkeleton } from "@/components/Skeleton";

const categoryLabels: Record<Category, string> = {
  video: "Vídeo",
  musica: "Música",
  software: "Software",
  cursos: "Cursos",
  outro: "Outro",
};

const categoryColors: Record<Category, string> = {
  video: "bg-red-500/10 text-red-400 border-red-500/20",
  musica: "bg-green-500/10 text-green-400 border-green-500/20",
  software: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  cursos: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  outro: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function getDaysUntilDue(day: number): number {
  const now = new Date();
  const due = new Date(now.getFullYear(), now.getMonth(), day);
  if (due < now) {
    due.setMonth(due.getMonth() + 1);
  }
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function AddSubscriptionDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("video");
  const [totalMonthly, setTotalMonthly] = useState("");
  const [individualPrice, setIndividualPrice] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [dueDay, setDueDay] = useState("15");

  const iconsByCategory: Record<Category, string> = {
    video: "🎬",
    musica: "🎵",
    software: "💻",
    cursos: "📚",
    outro: "📦",
  };

  const addSubscription = useMutation(api.subscriptions.create);

  const handleSubmit = async () => {
    if (!name || !totalMonthly) return;
    await addSubscription({
      name,
      category,
      icon: iconsByCategory[category],
      totalMonthly: parseFloat(totalMonthly),
      individualPrice: individualPrice ? parseFloat(individualPrice) : parseFloat(totalMonthly),
      startDate: startDate || new Date().toISOString().slice(0, 10),
      dueDay: parseInt(dueDay),
    });
    setName("");
    setTotalMonthly("");
    setIndividualPrice("");
    setStartDate(new Date().toISOString().slice(0, 10));
    setDueDay("15");
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md shadow-2xl safe-bottom max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Nova Assinatura</h2>
              <Button variant="ghost" size="icon" className="size-11" onClick={onClose}>
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Ex: Netflix"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {iconsByCategory[key as Category]} {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Mensal do Grupo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={totalMonthly}
                    onChange={(e) => setTotalMonthly(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preço Individual Est. (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={individualPrice}
                    onChange={(e) => setIndividualPrice(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Dia do Vencimento</Label>
                  <Select value={dueDay} onValueChange={setDueDay}>
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          Dia {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {individualPrice && totalMonthly && parseFloat(individualPrice) > parseFloat(totalMonthly) && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                  <PiggyBank className="size-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs text-emerald-400 font-medium">
                    Economia mensal do grupo: {formatCurrency(parseFloat(individualPrice) - parseFloat(totalMonthly))}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 h-12" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                className="flex-1 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={!name || !totalMonthly}
              >
                Adicionar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type FilterType = "all" | "pending" | "paid";

export default function Dashboard() {
  const storage = useStorage();
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const seedAll = useAction(api.seed.seedAll);

  const isLoading = storage.subscriptions === undefined;
  const shouldSeed = !isLoading && storage.subscriptions.length === 0;

  // Filter subscriptions
  const filteredSubscriptions = (storage.subscriptionsWithPeople || []).filter((sub) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = sub.name.toLowerCase().includes(q);
      const personMatch = sub.people?.some(
        (p: any) => p.name.toLowerCase().includes(q),
      );
      if (!nameMatch && !personMatch) return false;
    }

    // Status filter
    if (activeFilter === "pending") {
      const hasPending = sub.people?.some((p: any) => !p.paidThisMonth);
      if (!hasPending) return false;
    } else if (activeFilter === "paid") {
      const allPaid = sub.people?.length > 0 && sub.people.every((p: any) => p.paidThisMonth);
      if (!allPaid) return false;
    }

    return true;
  });

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "pending", label: "Com Pendência" },
    { key: "paid", label: "100% Pagos" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-2xl mx-auto px-4 pb-24 safe-bottom">
        {/* PWA Install Banner */}
        <div className="pt-4">
          <PWAInstallBanner />
        </div>

        {isLoading ? (
          <div className="pt-4">
            <DashboardSkeleton />
          </div>
        ) : (
          <>
            {/* Savings Highlight Card */}
            {storage.totalAccumulatedSavings > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Card className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/20 shadow-none py-5">
                  <CardContent className="px-5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center size-12 rounded-2xl bg-emerald-500/15">
                        <PiggyBank className="size-6 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-emerald-400/80 font-medium uppercase tracking-wide">
                          Economia Gerada no Ano
                        </p>
                        <p className="text-2xl font-bold text-emerald-400 mt-0.5">
                          {formatCurrency(storage.totalAccumulatedSavings)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Card className="bg-card/60 border-border/40 shadow-none py-4">
                <CardContent className="px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-[var(--paid)]/10">
                      <TrendingUp className="size-4 text-[var(--paid)]" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Total Pago</p>
                  <p className="text-xl font-bold text-[var(--paid)] mt-1">
                    {formatCurrency(storage.totalPaid)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card/60 border-border/40 shadow-none py-4">
                <CardContent className="px-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center size-8 rounded-lg bg-[var(--pending)]/10">
                      <TrendingDown className="size-4 text-[var(--pending)]" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">Pendente a Receber</p>
                  <p className="text-xl font-bold text-[var(--pending)] mt-1">
                    {formatCurrency(storage.totalPending)}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Buscar assinatura ou pessoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card/60 border-border/40 rounded-xl"
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
              <Filter className="size-4 text-muted-foreground flex-shrink-0" />
              {filters.map((f) => (
                <Button
                  key={f.key}
                  variant={activeFilter === f.key ? "default" : "outline"}
                  size="sm"
                  className={`h-9 rounded-lg text-xs flex-shrink-0 px-3 ${
                    activeFilter === f.key
                      ? "bg-primary text-primary-foreground"
                      : "bg-card/60 border-border/40 text-muted-foreground"
                  }`}
                  onClick={() => setActiveFilter(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            {/* Subscriptions Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Assinaturas
                {searchQuery || activeFilter !== "all" ? (
                  <span className="text-sm text-muted-foreground font-normal ml-2">
                    ({filteredSubscriptions.length})
                  </span>
                ) : null}
              </h2>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-11 rounded-xl text-sm"
                onClick={() => setShowAddDialog(true)}
              >
                <Plus className="size-4" />
                Nova
              </Button>
            </div>

            {/* Subscription Cards */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredSubscriptions.map((sub, index) => {
                  const daysUntilDue = getDaysUntilDue(sub.dueDay);
                  const paidCount = sub.people.filter((p: any) => p.paidThisMonth).length;
                  const totalPeople = sub.people.length;
                  const pendingPeople = totalPeople - paidCount;
                  const subSavings = sub.people.reduce(
                    (sum: number, p: any) => sum + storage.getPersonSavings(sub.individualPrice, p.amount, p.monthsPaid),
                    0,
                  );
                  const subPendingDebt = sub.people
                    .filter((p: any) => !p.paidThisMonth)
                    .reduce((sum: number, p: any) => sum + p.amount * (p.unpaidMonths || 1), 0);

                  return (
                    <motion.div
                      key={sub._id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className="bg-card/60 border-border/40 shadow-none hover:border-primary/20 transition-all cursor-pointer active:scale-[0.99]"
                        onClick={() => navigate(`/subscription/${sub._id}`)}
                      >
                        <CardContent className="px-5 py-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              <div className="flex items-center justify-center size-11 rounded-xl bg-surface text-xl flex-shrink-0">
                                {sub.icon}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold truncate">{sub.name}</h3>
                                  <span
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryColors[sub.category]}`}
                                  >
                                    {categoryLabels[sub.category]}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(sub.totalMonthly)}
                                  </span>
                                  <span>•</span>
                                  <span>vence em {daysUntilDue}d</span>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                  {subSavings > 0 && (
                                    <span className="text-emerald-400 font-medium text-xs">
                                      💚 {formatCurrency(subSavings)} economizados
                                    </span>
                                  )}
                                  {subPendingDebt > 0 && (
                                    <span className="text-[var(--pending)] font-medium text-xs flex items-center gap-1">
                                      <AlertTriangle className="size-3" />
                                      {formatCurrency(subPendingDebt)} em aberto
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0 ml-3">
                              <div
                                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                                  pendingPeople > 0
                                    ? "bg-[var(--pending)]/10 text-[var(--pending)]"
                                    : "bg-[var(--paid)]/10 text-[var(--paid)]"
                                }`}
                              >
                                {pendingPeople > 0 ? (
                                  <DollarSign className="size-3" />
                                ) : (
                                  <Check className="size-3" />
                                )}
                                {pendingPeople > 0
                                  ? `${pendingPeople} pendente${pendingPeople > 1 ? "s" : ""}`
                                  : "Todos pagaram"}
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {paidCount}/{totalPeople}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredSubscriptions.length === 0 && storage.subscriptions.length > 0 && (
              <div className="text-center py-12">
                <p className="text-3xl mb-3">🔍</p>
                <p className="text-muted-foreground font-medium">Nenhum resultado encontrado</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente ajustar a busca ou filtros
                </p>
              </div>
            )}

            {storage.subscriptions.length === 0 && !shouldSeed && (
              <div className="text-center py-16">
                <p className="text-4xl mb-4">📭</p>
                <p className="text-muted-foreground font-medium">Nenhuma assinatura ainda</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Toque em "Nova" para adicionar sua primeira assinatura
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <AddSubscriptionDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}
