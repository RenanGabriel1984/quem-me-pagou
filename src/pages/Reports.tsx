import { motion } from "framer-motion";
import { useStorage } from "@/hooks/use-storage";
import type { Category } from "@/types/data";
import { monthsSinceStart, totalPersonSavings } from "@/types/data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PieChart as PieChartIcon,
  BarChart3,
  DollarSign,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { DashboardSkeleton } from "@/components/Skeleton";

const categoryLabels: Record<Category, string> = {
  video: "Vídeo",
  musica: "Música",
  software: "Software",
  cursos: "Cursos",
  outro: "Outro",
};

const categoryColors: Record<Category, string> = {
  video: "#ef4444",
  musica: "#22c55e",
  software: "#3b82f6",
  cursos: "#a855f7",
  outro: "#f59e0b",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Reports() {
  const storage = useStorage();
  const isLoading = storage.subscriptions === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 safe-bottom">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  const subs = storage.subscriptionsWithPeople || [];

  // ── Category distribution data ────────────────────────────────────
  const categoryData = subs.reduce(
    (acc, sub) => {
      const existing = acc.find((d) => d.category === sub.category);
      if (existing) {
        existing.value += sub.totalMonthly;
        existing.count += 1;
      } else {
        acc.push({
          category: sub.category,
          label: categoryLabels[sub.category],
          value: sub.totalMonthly,
          count: 1,
          color: categoryColors[sub.category],
        });
      }
      return acc;
    },
    [] as { category: string; label: string; value: number; count: number; color: string }[],
  );

  // ── Monthly savings by subscription (bar chart) ───────────────────
  const savingsData = subs
    .map((sub) => {
      const monthlySavings = sub.people.reduce(
        (sum: number, p: any) => sum + Math.max(0, sub.individualPrice - p.amount),
        0,
      );
      return {
        name: sub.name,
        economia: monthlySavings,
        custoIndividual: sub.individualPrice * sub.people.length,
        custoGrupo: sub.totalMonthly,
      };
    })
    .sort((a, b) => b.economia - a.economia);

  // ── Totals ────────────────────────────────────────────────────────
  const totalMonthlyGroup = subs.reduce((sum, s) => sum + s.totalMonthly, 0);
  const totalIndividualAll = subs.reduce(
    (sum, s) => sum + s.individualPrice * s.people.length,
    0,
  );
  const totalMonthlySavings = totalIndividualAll - totalMonthlyGroup;

  // ── Annual projection ─────────────────────────────────────────────
  const annualSavings = storage.totalAccumulatedSavings;
  const monthlySavingsRate = totalMonthlySavings;

  // ── Cost comparison: gross vs admin pays ──────────────────────────
  const totalGross = totalIndividualAll;
  const adminPays = totalMonthlyGroup;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <div className="max-w-2xl mx-auto px-4 pb-24 safe-bottom">
        <header className="pt-4 pb-2">
          <h1 className="text-xl font-bold">Relatórios</h1>
          <p className="text-sm text-muted-foreground">Visão geral das finanças do grupo</p>
        </header>

        {/* ── Cost Comparison Card ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-5"
        >
          <Card className="bg-gradient-to-br from-emerald-500/8 via-emerald-500/3 to-transparent border-emerald-500/15 shadow-none">
            <CardContent className="px-5 py-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="size-4 text-emerald-400" />
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  Impacto de Dividir os Custos
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground font-medium uppercase">
                    Custo Bruto
                  </p>
                  <p className="text-sm font-bold text-muted-foreground mt-0.5 line-through decoration-destructive/40">
                    {formatCurrency(totalGross)}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60">se cada um pagasse sozinho</p>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-emerald-400 font-medium uppercase">
                    Grupo Paga
                  </p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(adminPays)}
                  </p>
                  <p className="text-[9px] text-emerald-400/60">total mensal do grupo</p>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-emerald-400 font-medium uppercase">
                    Economia/Mês
                  </p>
                  <p className="text-sm font-bold text-emerald-400 mt-0.5">
                    {formatCurrency(monthlySavingsRate)}
                  </p>
                  <p className="text-[9px] text-emerald-400/60">
                    {monthlySavingsRate > 0
                      ? `${((monthlySavingsRate / totalGross) * 100).toFixed(0)}% de desconto`
                      : "—"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Summary Stats Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/60 border-border/40 shadow-none py-4">
              <CardContent className="px-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <PiggyBank className="size-4 text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Economia Acumulada</p>
                <p className="text-xl font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(annualSavings)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {subs.length > 0
                    ? `Em ${subs.reduce((max, s) => Math.max(max, monthsSinceStart(s.startDate)), 0)} meses de operação`
                    : "Sem dados"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="bg-card/60 border-border/40 shadow-none py-4">
              <CardContent className="px-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="size-4 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Total Mensal do Grupo</p>
                <p className="text-xl font-bold mt-0.5">
                  {formatCurrency(totalMonthlyGroup)}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {subs.length} assinatura{subs.length !== 1 ? "s" : ""} ativa{subs.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ── Category Distribution Pie ─────────────────────────────── */}
        {categoryData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-5"
          >
            <Card className="bg-card/60 border-border/40 shadow-none">
              <CardContent className="px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <PieChartIcon className="size-4 text-muted-foreground" />
                  <p className="text-sm font-semibold">Distribuição por Categoria</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-40 h-40 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={60}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 space-y-2">
                    {categoryData.map((cat) => (
                      <div key={cat.category} className="flex items-center gap-2">
                        <div
                          className="size-3 rounded-sm flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-muted-foreground flex-1 truncate">
                          {cat.label}
                        </span>
                        <span className="text-xs font-medium">{formatCurrency(cat.value)}</span>
                        <span className="text-[10px] text-muted-foreground">
                          ({cat.count})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ── Savings by Subscription Bar Chart ─────────────────────── */}
        {savingsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-5"
          >
            <Card className="bg-card/60 border-border/40 shadow-none">
              <CardContent className="px-5 py-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="size-4 text-emerald-400" />
                  <p className="text-sm font-semibold">Economia Mensal por Assinatura</p>
                </div>

                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={savingsData}
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `R$${v}`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="custoGrupo" name="Custo Grupo" fill="var(--paid)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="economia" name="Economia" fill="var(--pending)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-sm bg-[var(--paid)]" />
                    <span className="text-[10px] text-muted-foreground">Custo Grupo</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-sm bg-[var(--pending)]" />
                    <span className="text-[10px] text-muted-foreground">Economia Individual</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {subs.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-muted-foreground font-medium">Sem dados para exibir</p>
            <p className="text-sm text-muted-foreground mt-1">
              Adicione assinaturas no Dashboard para ver os relatórios
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
