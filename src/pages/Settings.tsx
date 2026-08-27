import { useState, useEffect } from "react";
import { useAction, useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useStorage } from "@/hooks/use-storage";
import { api } from "../convex/_generated/api";
import {
  Save,
  Key,
  User,
  RotateCcw,
  Info,
  Cloud,
  CloudDownload,
  CloudUpload,
  Loader2,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";

export default function Settings() {
  const storage = useStorage();

  const [pixKey, setPixKey] = useState(storage.settings.pixKey);
  const [ownerName, setOwnerName] = useState(storage.settings.ownerName);

  // Backup/restore state
  const [gistId, setGistId] = useState(() => {
    return localStorage.getItem("qmp_gist_id") || "";
  });
  const [restoreGistId, setRestoreGistId] = useState("");
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(() => {
    return localStorage.getItem("qmp_last_backup") || "";
  });

  // Convex actions
  const backupToGist = useAction(api.github.backupToGist);
  const restoreFromGist = useAction(api.github.restoreFromGist);
  const restoreAll = useMutation(api.restore.restoreAll);



  // Sync local state with Convex data
  useEffect(() => {
    setPixKey(storage.settings.pixKey);
    setOwnerName(storage.settings.ownerName);
  }, [storage.settings.pixKey, storage.settings.ownerName]);

  const handleSave = async () => {
    await storage.updateSettings({ pixKey, ownerName });
    toast.success("Configurações salvas!");
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      // Gather all data from Convex via the hook
      const allPeople: any[] = [];
      for (const [subIndex, sub] of storage.subscriptionsWithPeople.entries()) {
        sub.people.forEach((p: any) => {
          allPeople.push({
            subscriptionIndex: subIndex,
            name: p.name,
            phone: p.phone,
            amount: p.amount,
            paidThisMonth: p.paidThisMonth,
            monthsPaid: p.monthsPaid,
            unpaidMonths: p.unpaidMonths,
            lastPaymentDate: p.lastPaymentDate,
            lastPaidAt: p.lastPaidAt,
            proofNote: p.proofNote,
          });
        });
      }

      const result = await backupToGist({
        subscriptions: storage.subscriptions,
        people: allPeople,
        settings: storage.settings,
        gistId: gistId || undefined,
      });

      setGistId(result.gistId);
      localStorage.setItem("qmp_gist_id", result.gistId);

      const now = new Date().toLocaleString("pt-BR");
      setLastBackup(now);
      localStorage.setItem("qmp_last_backup", now);

      toast.success("Backup realizado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer backup");
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async () => {
    const idToUse = restoreGistId || gistId;
    if (!idToUse) {
      toast.error("Informe o ID do Gist para restaurar.");
      return;
    }

    if (
      !confirm(
        "Isso vai SUBSTITUIR todos os seus dados atuais. Continuar?",
      )
    ) {
      return;
    }

    setRestoreLoading(true);
    try {
      const result = await restoreFromGist({ gistId: idToUse });

      // Build the restore data
      const restoreData = {
        subscriptions: result.data.subscriptions.map((s: any) => ({
          _id: s._id,
          name: s.name,
          category: s.category,
          icon: s.icon,
          totalMonthly: s.totalMonthly,
          individualPrice: s.individualPrice,
          startDate: s.startDate,
          dueDay: s.dueDay,
        })),
        people: result.data.people.map((p: any) => ({
          subscriptionIndex: p.subscriptionIndex ?? 0,
          name: p.name,
          phone: p.phone,
          amount: p.amount,
          paidThisMonth: p.paidThisMonth,
          monthsPaid: p.monthsPaid,
          unpaidMonths: p.unpaidMonths,
          lastPaymentDate: p.lastPaymentDate,
          proofNote: p.proofNote,
        })),
        settings: result.data.settings,
      };

      await restoreAll(restoreData);

      if (idToUse !== gistId) {
        setGistId(idToUse);
        localStorage.setItem("qmp_gist_id", idToUse);
      }

      toast.success("Dados restaurados! Recarregando...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      toast.error(err.message || "Erro ao restaurar dados");
    } finally {
      setRestoreLoading(false);
    }
  };

  const copyGistId = () => {
    if (gistId) {
      navigator.clipboard.writeText(gistId);
      toast.success("ID do Gist copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 pb-24 safe-bottom">
        {/* Header */}
        <header className="flex items-center gap-3 pt-4 pb-6">
          <div>
            <h1 className="text-xl font-bold">Configurações</h1>
            <p className="text-sm text-muted-foreground">
              Chave PIX, dados pessoais e backup
            </p>
          </div>
        </header>

        <div className="space-y-5">
          {/* PIX Key */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="bg-card/60 border-border/40 shadow-none">
              <CardContent className="px-5 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                    <Key className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Chave PIX</h3>
                    <p className="text-xs text-muted-foreground">
                      Incluída nas mensagens de cobrança
                    </p>
                  </div>
                </div>
                <Input
                  placeholder="Ex: 123.456.789-00, email@ex.com.br"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  className="h-12"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Owner Name */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-card/60 border-border/40 shadow-none">
              <CardContent className="px-5 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                    <User className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Seu nome</h3>
                    <p className="text-xs text-muted-foreground">
                      Aparece no final das mensagens
                    </p>
                  </div>
                </div>
                <Input
                  placeholder="Ex: Carlos"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="h-12"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Button
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-semibold text-base gap-2 active:scale-95"
              onClick={handleSave}
            >
              <Save className="size-4" />
              Salvar Configurações
            </Button>
          </motion.div>

          {/* ── GitHub Backup Section ──────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/60 border-border/40 shadow-none">
              <CardContent className="px-5 py-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center size-10 rounded-xl bg-sky-500/10">
                    <Cloud className="size-5 text-sky-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Backup GitHub</h3>
                    <p className="text-xs text-muted-foreground">
                      Salve seus dados em um Gist privado no GitHub
                    </p>
                  </div>
                </div>

                {/* Gist ID display */}
                {gistId && (
                  <div className="flex items-center gap-2 mb-3 p-2.5 rounded-lg bg-muted/50 text-xs">
                    <span className="text-muted-foreground truncate flex-1">
                      Gist: {gistId}
                    </span>
                    <button
                      onClick={copyGistId}
                      className="text-primary hover:text-primary/80 active:scale-90 p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    >
                      <Copy className="size-3.5" />
                    </button>
                  </div>
                )}

                {lastBackup && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Último backup: {lastBackup}
                  </p>
                )}

                {/* Backup Button */}
                <Button
                  className="w-full h-12 rounded-xl font-semibold gap-2 active:scale-95 bg-sky-600 text-white hover:bg-sky-700 mb-2.5"
                  onClick={handleBackup}
                  disabled={backupLoading}
                >
                  {backupLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CloudUpload className="size-4" />
                  )}
                  {gistId ? "Atualizar Backup" : "Criar Backup"}
                </Button>

                {/* Restore Section */}
                <div className="space-y-2.5">
                  <Input
                    placeholder="Cole o ID do Gist para restaurar..."
                    value={restoreGistId}
                    onChange={(e) => setRestoreGistId(e.target.value)}
                    className="h-12 text-sm"
                  />
                  <Button
                    variant="outline"
                    className="w-full h-12 rounded-xl font-semibold gap-2 active:scale-95"
                    onClick={handleRestore}
                    disabled={restoreLoading || (!restoreGistId && !gistId)}
                  >
                    {restoreLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CloudDownload className="size-4" />
                    )}
                    Restaurar Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="bg-card/30 border-border/30 shadow-none">
              <CardContent className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <Info className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="mb-2">
                      Todos os dados são salvos no Convex e sincronizados em
                      tempo real entre seus dispositivos.
                    </p>
                    <p className="mb-2">
                      Use o <strong>Backup GitHub</strong> para ter uma cópia de
                      segurança fora da plataforma. O gist é{" "}
                      <strong>privado</strong> e só você pode acessar.
                    </p>
                    <p>
                      Para restaurar em outro dispositivo, copie o ID do Gist e
                      cole no campo acima.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reset Data */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 h-12 active:scale-95"
              onClick={() => {
                if (
                  confirm("Isso vai apagar TODOS os seus dados. Tem certeza?")
                ) {
                  toast.success("Dados resetados! Recarregando...");
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                }
              }}
            >
              <RotateCcw className="size-4" />
              Resetar Todos os Dados
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
