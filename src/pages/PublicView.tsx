import { useParams } from "react-router";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import type { Category } from "@/types/data";
import { totalPersonSavings, monthsSinceStart, formatStartMonth } from "@/types/data";
import {
  Check,
  Clock,
  AlertTriangle,
  PiggyBank,
  DollarSign,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PixCopyButton, PixQRCode } from "@/components/PixDisplay";

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

export default function PublicView() {
  const { id } = useParams<{ id: string }>();

  const subscription = useQuery(
    api.subscriptions.get,
    id ? { id: id as Id<"subscriptions"> } : "skip",
  );
  const people = useQuery(
    api.people.listBySubscription,
    id ? { subscriptionId: id as Id<"subscriptions"> } : "skip",
  );
  const settings = useQuery(api.settings.get) ?? { pixKey: "", ownerName: "" };

  const isLoading = subscription === undefined || people === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl mb-3">🔍</p>
          <p className="text-muted-foreground font-medium">Assinatura não encontrada</p>
          <p className="text-xs text-muted-foreground mt-1">O link pode estar incorreto</p>
        </div>
      </div>
    );
  }

  const personList = people ?? [];
  const paidCount = personList.filter((p) => p.paidThisMonth).length;
  const totalCount = personList.length;

  // Savings
  const groupSavings = personList.reduce(
    (sum, p) => sum + totalPersonSavings(subscription.individualPrice, p.amount, p.monthsPaid),
    0,
  );
  const monthlySaving = Math.max(0, subscription.individualPrice - subscription.totalMonthly);
  const monthsActive = monthsSinceStart(subscription.startDate);

  // Debt
  const pendingDebt = personList
    .filter((p) => !p.paidThisMonth)
    .reduce((sum, p) => sum + p.amount * (p.unpaidMonths || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-2">
          <span className="text-lg">💸</span>
          <span className="text-sm font-bold text-foreground">Quem me Pagou?</span>
          <div className="ml-auto flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Shield className="size-3 text-emerald-400" />
            <span className="text-[10px] font-medium text-emerald-400">Transparência</span>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 safe-bottom">
        {/* ── Subscription Info ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center size-12 rounded-2xl bg-surface text-2xl">
              {subscription.icon}
            </div>
            <div>
              <h1 className="text-xl font-bold">{subscription.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryColors[subscription.category]}`}
                >
                  {categoryLabels[subscription.category]}
                </span>
                <span className="text-xs text-muted-foreground">
                  Vence dia {subscription.dueDay}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Cost Summary ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 12, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-5"
        >
          <Card className="bg-card/60 border-border/40 shadow-none">
            <CardContent className="px-5 py-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Total</p>
                  <p className="text-sm font-bold mt-0.5">{formatCurrency(subscription.totalMonthly)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">Individual</p>
                  <p className="text-sm font-bold mt-0.5 line-through decoration-muted-foreground/40">
                    {formatCurrency(subscription.individualPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-400 uppercase font-medium">Economia</p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(monthlySaving)}/mês
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Savings Banner ──────────────────────────────────────────── */}
        {groupSavings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-5"
          >
            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="size-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">
                    Você economiza {formatCurrency(monthlySaving)} por mês nesta assinatura!
                  </p>
                  <p className="text-xs text-emerald-400/70 mt-0.5">
                    Economia total do grupo: {formatCurrency(groupSavings)} em {monthsActive} meses
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── PIX Section ─────────────────────────────────────────────── */}
        {settings.pixKey && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-5"
          >
            <Card className="bg-card/60 border-border/40 shadow-none">
              <CardContent className="px-5 py-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Pagamento via PIX
                </p>
                <div className="flex items-center gap-2">
                  <PixCopyButton
                    pixKey={settings.pixKey}
                    amount={pendingDebt > 0 ? pendingDebt / (totalCount - paidCount || 1) : subscription.totalMonthly / (totalCount || 1)}
                    ownerName={settings.ownerName || "Quem Me Pagou"}
                    description={`Cota ${subscription.name}`}
                  />
                  <PixQRCode
                    pixKey={settings.pixKey}
                    amount={pendingDebt > 0 ? pendingDebt / (totalCount - paidCount || 1) : subscription.totalMonthly / (totalCount || 1)}
                    ownerName={settings.ownerName || "Quem Me Pagou"}
                    description={`Cota ${subscription.name}`}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 break-all">
                  Chave: {settings.pixKey}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── People Status ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">
              Status do Mês ({paidCount}/{totalCount})
            </h2>
            <div className="flex items-center gap-1.5">
              {personList.some((p) => !p.paidThisMonth) && (
                <span className="text-[10px] text-[var(--pending)] font-medium">
                  {formatCurrency(pendingDebt)} em aberto
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {personList.map((person, index) => {
              const sav = totalPersonSavings(
                subscription.individualPrice,
                person.amount,
                person.monthsPaid,
              );

              return (
                <motion.div
                  key={person._id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                >
                  <div
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all ${
                      person.paidThisMonth
                        ? "bg-[var(--paid)]/5 border-[var(--paid)]/20"
                        : "bg-card/60 border-border/40"
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex items-center justify-center size-9 rounded-full text-xs font-bold flex-shrink-0 ${
                        person.paidThisMonth
                          ? "bg-[var(--paid)]/15 text-[var(--paid)]"
                          : "bg-surface text-muted-foreground"
                      }`}
                    >
                      {person.paidThisMonth ? (
                        <Check className="size-4" />
                      ) : (
                        person.name.charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-sm truncate">{person.name}</span>
                        {person.paidThisMonth ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--paid)]/15 text-[var(--paid)] text-[10px] font-semibold">
                            <Check className="size-2.5" />
                            Pago
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--pending)]/15 text-[var(--pending)] text-[10px] font-semibold">
                            <Clock className="size-2.5" />
                            Pendente
                          </span>
                        )}
                        {!person.paidThisMonth && (person.unpaidMonths || 0) > 1 && (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--pending)]/15 text-[var(--pending)] text-[10px] font-semibold">
                            <AlertTriangle className="size-2.5" />
                            {person.unpaidMonths}m
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatCurrency(person.amount)}/mês
                        {sav > 0 && (
                          <span className="ml-2 text-emerald-400/60">
                            · economizou {formatCurrency(sav)}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${person.paidThisMonth ? "text-[var(--paid)]" : ""}`}>
                        {formatCurrency(person.amount)}
                      </p>
                      {!person.paidThisMonth && (person.unpaidMonths || 0) > 0 && (
                        <p className="text-[10px] text-[var(--pending)]">
                          {formatCurrency(person.amount * (person.unpaidMonths || 0))} total
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="text-center mt-8 pb-4">
          <p className="text-[10px] text-muted-foreground/50">
            Gerado por Quem me Pagou? · {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}

