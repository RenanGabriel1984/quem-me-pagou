import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useStorage } from "@/hooks/use-storage";
import type { Category } from "@/types/data";
import { formatStartMonth, totalPersonSavings, monthsSinceStart } from "@/types/data";
import {
  ArrowLeft,
  Plus,
  Check,
  Trash2,
  MessageCircle,
  X,
  Phone,
  DollarSign,
  AlertCircle,
  PiggyBank,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

function getDueDate(day: number): string {
  const now = new Date();
  const due = new Date(now.getFullYear(), now.getMonth(), day);
  if (due < now) {
    due.setMonth(due.getMonth() + 1);
  }
  return due.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
}

export default function SubscriptionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const storage = useStorage();

  const [showAddPerson, setShowAddPerson] = useState(false);
  const [personName, setPersonName] = useState("");
  const [personPhone, setPersonPhone] = useState("");
  const [personAmount, setPersonAmount] = useState("");

  const subscription = storage.state.subscriptions.find((s) => s.id === id);

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-muted-foreground">Assinatura não encontrada</p>
          <Button variant="ghost" className="mt-4" onClick={() => navigate("/dashboard")}>
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue(subscription.dueDay);
  const paidCount = subscription.people.filter((p) => p.paidThisMonth).length;
  const totalPeople = subscription.people.length;
  const pendingPeople = totalPeople - paidCount;
  const paidAmount = subscription.people
    .filter((p) => p.paidThisMonth)
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = subscription.people
    .filter((p) => !p.paidThisMonth)
    .reduce((sum, p) => sum + p.amount, 0);

  // ── Savings calculations ──────────────────────────────────────────
  const groupSavingsPerMonth = subscription.people.reduce(
    (sum, p) => sum + (subscription.individualPrice - p.amount),
    0,
  );
  const groupTotalSavings = subscription.people.reduce(
    (sum, p) => sum + totalPersonSavings(subscription.individualPrice, p.amount, p.monthsPaid),
    0,
  );
  const monthsActive = monthsSinceStart(subscription.startDate);

  const handleAddPerson = () => {
    if (!personName || !personPhone || !personAmount) return;
    storage.addPerson(subscription.id, {
      name: personName,
      phone: personPhone.replace(/\D/g, ""),
      amount: parseFloat(personAmount),
    });
    setPersonName("");
    setPersonPhone("");
    setPersonAmount("");
    setShowAddPerson(false);
    toast.success("Pessoa adicionada com sucesso!");
  };

  const handleWhatsApp = (person: { name: string; phone: string; amount: number; monthsPaid: number }) => {
    const pixKey = storage.state.settings.pixKey || "CHAVE_PIX_NAO_CONFIGURADA";
    const ownerName = storage.state.settings.ownerName || "Proprietário";
    const dueDate = getDueDate(subscription.dueDay);
    const personSavings = totalPersonSavings(
      subscription.individualPrice,
      person.amount,
      person.monthsPaid,
    );
    const startLabel = formatStartMonth(subscription.startDate);

    const message = [
      `Fala ${person.name}! 🍿`,
      ``,
      `Sua cota do *${subscription.name}* vence dia *${dueDate}*.`,
      ``,
      `💰 Valor: *${formatCurrency(person.amount)}*`,
      `🔑 Pix: *${pixKey}*`,
      ``,
      personSavings > 0
        ? `💡 Você sabia? Ao dividir esse plano com a gente, você já economizou *${formatCurrency(personSavings)}* desde ${startLabel}!`
        : `💡 Ao dividir esse plano com a gente você economiza *${formatCurrency(subscription.individualPrice - person.amount)}* por mês!`,
    ].join("\n");

    const url = `https://wa.me/55${person.phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleDeletePerson = (personId: string) => {
    if (confirm("Remover esta pessoa?")) {
      storage.deletePerson(subscription.id, personId);
      toast.success("Pessoa removida");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 pb-24 safe-bottom">
        {/* Header */}
        <header className="flex items-center gap-3 pt-6 pb-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-10 -ml-2"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{subscription.icon}</span>
              <h1 className="text-xl font-bold truncate">{subscription.name}</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${categoryColors[subscription.category]}`}
              >
                {categoryLabels[subscription.category]}
              </span>
              <span className="text-sm text-muted-foreground">
                Vence dia {subscription.dueDay} · {daysUntilDue}d
              </span>
            </div>
          </div>
        </header>

        {/* Summary Row */}
        <div className="grid grid-cols-3 gap-2 my-5">
          <div className="rounded-xl bg-surface/60 border border-surface-border/40 p-3 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Total</p>
            <p className="text-sm font-bold mt-0.5">{formatCurrency(subscription.totalMonthly)}</p>
          </div>
          <div className="rounded-xl bg-[var(--paid)]/5 border border-[var(--paid)]/15 p-3 text-center">
            <p className="text-[10px] text-[var(--paid)] uppercase tracking-wide font-medium">Pago</p>
            <p className="text-sm font-bold text-[var(--paid)] mt-0.5">{formatCurrency(paidAmount)}</p>
          </div>
          <div className="rounded-xl bg-[var(--pending)]/5 border border-[var(--pending)]/15 p-3 text-center">
            <p className="text-[10px] text-[var(--pending)] uppercase tracking-wide font-medium">Pendente</p>
            <p className="text-sm font-bold text-[var(--pending)] mt-0.5">{formatCurrency(pendingAmount)}</p>
          </div>
        </div>

        {/* Individual vs Group Comparison Card */}
        {subscription.individualPrice > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-emerald-500/8 via-emerald-500/3 to-transparent border-emerald-500/15 shadow-none py-4 mb-4">
              <CardContent className="px-5">
                <div className="flex items-center gap-2 mb-3">
                  <PiggyBank className="size-4 text-emerald-400" />
                  <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                    Comparativo de Economia
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Individual price */}
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase">Individual</p>
                    <p className="text-lg font-bold text-muted-foreground mt-0.5 line-through decoration-destructive/40">
                      {formatCurrency(subscription.individualPrice)}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60">por pessoa</p>
                  </div>

                  <TrendingDown className="size-5 text-emerald-400 flex-shrink-0" />

                  {/* Group price */}
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-emerald-400 font-medium uppercase">No Grupo</p>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">
                      {formatCurrency(subscription.totalMonthly)}
                    </p>
                    <p className="text-[10px] text-emerald-400/60">total do grupo</p>
                  </div>

                  <div className="w-px h-10 bg-emerald-500/20 flex-shrink-0" />

                  {/* Total saved */}
                  <div className="flex-1 text-center">
                    <p className="text-[10px] text-emerald-400 font-medium uppercase">Economizado</p>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">
                      {formatCurrency(groupTotalSavings)}
                    </p>
                    <p className="text-[10px] text-emerald-400/60">
                      {monthsActive} mes(es) ativo(s)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* People Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">
            Pessoas ({paidCount}/{totalPeople})
          </h2>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 h-8 rounded-lg text-xs"
            onClick={() => setShowAddPerson(true)}
          >
            <Plus className="size-3.5" />
            Adicionar
          </Button>
        </div>

        {/* Warning if PIX not configured */}
        {!storage.state.settings.pixKey && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--pending)]/5 border border-[var(--pending)]/20 mb-3">
            <AlertCircle className="size-4 text-[var(--pending)] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-[var(--pending)]">
                Configure sua chave PIX nas configurações para incluí-la nas mensagens de cobrança.
              </p>
            </div>
          </div>
        )}

        {/* People List */}
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {subscription.people.map((person, index) => {
              const personSav = totalPersonSavings(
                subscription.individualPrice,
                person.amount,
                person.monthsPaid,
              );

              return (
                <motion.div
                  key={person.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card
                    className={`py-0 overflow-hidden transition-all shadow-none ${
                      person.paidThisMonth
                        ? "bg-[var(--paid)]/5 border-[var(--paid)]/20"
                        : "bg-card/60 border-border/40"
                    }`}
                  >
                    <CardContent className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div
                          className={`flex items-center justify-center size-10 rounded-full text-sm font-bold flex-shrink-0 ${
                            person.paidThisMonth
                              ? "bg-[var(--paid)]/15 text-[var(--paid)]"
                              : "bg-surface text-muted-foreground"
                          }`}
                        >
                          {person.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium truncate text-sm">{person.name}</span>
                            {person.paidThisMonth && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-[var(--paid)]/15 text-[var(--paid)] text-[10px] font-semibold">
                                <Check className="size-2.5" />
                                Pago
                              </span>
                            )}
                            {personSav > 0 && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                                <PiggyBank className="size-2.5" />
                                Economizou {formatCurrency(personSav)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatCurrency(person.amount)}/mês
                            {person.phone && (
                              <span className="ml-2 text-muted-foreground/60">
                                {person.phone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3")}
                              </span>
                            )}
                            {person.monthsPaid > 0 && (
                              <span className="ml-2 text-emerald-400/60">
                                · {person.monthsPaid}m pago{person.monthsPaid > 1 ? "s" : ""}
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <Button
                            variant={person.paidThisMonth ? "outline" : "default"}
                            size="sm"
                            className={`h-8 px-2.5 text-xs gap-1 rounded-lg ${
                              person.paidThisMonth
                                ? "border-[var(--paid)]/30 text-[var(--paid)] hover:bg-[var(--paid)]/10"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                            onClick={() =>
                              storage.updatePersonStatus(
                                subscription.id,
                                person.id,
                                !person.paidThisMonth,
                              )
                            }
                          >
                            <Check className="size-3" />
                            {person.paidThisMonth ? "Pago" : "Marcar Pago"}
                          </Button>

                          {!person.paidThisMonth && person.phone && (
                            <Button
                              variant="outline"
                              size="icon"
                              className="size-8 border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-lg"
                              title="Enviar cobrança via WhatsApp"
                              onClick={() => handleWhatsApp(person)}
                            >
                              <MessageCircle className="size-3.5" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                            onClick={() => handleDeletePerson(person.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {subscription.people.length === 0 && (
          <div className="text-center py-12">
            <p className="text-3xl mb-3">👤</p>
            <p className="text-muted-foreground text-sm">Nenhuma pessoa adicionada</p>
          </div>
        )}
      </div>

      {/* Add Person Dialog */}
      <AnimatePresence>
        {showAddPerson && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowAddPerson(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-card border border-border/60 rounded-2xl p-6 w-full max-w-md shadow-2xl safe-bottom"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Adicionar Pessoa</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setShowAddPerson(false)}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    placeholder="Nome da pessoa"
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Telefone WhatsApp</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="11999887766"
                      className="pl-9"
                      value={personPhone}
                      onChange={(e) => setPersonPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    DDD + número, sem espaço. Ex: 11999887766
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Valor da Cota (R$)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      className="pl-9"
                      value={personAmount}
                      onChange={(e) => setPersonAmount(e.target.value)}
                    />
                  </div>
                  {personAmount && subscription.individualPrice > 0 && (
                    <p className="text-[11px] text-emerald-400 font-medium">
                      Economia mensal: {formatCurrency(subscription.individualPrice - parseFloat(personAmount))}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddPerson(false)}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleAddPerson}
                  disabled={!personName || !personPhone || !personAmount}
                >
                  Adicionar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
