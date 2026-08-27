import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useStorage } from "@/hooks/use-storage";
import {
  ArrowLeft,
  Save,
  Key,
  User,
  RotateCcw,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";

export default function Settings() {
  const storage = useStorage();
  const navigate = useNavigate();

  const [pixKey, setPixKey] = useState(storage.settings.pixKey);
  const [ownerName, setOwnerName] = useState(storage.settings.ownerName);

  // Sync local state with Convex data
  useEffect(() => {
    setPixKey(storage.settings.pixKey);
    setOwnerName(storage.settings.ownerName);
  }, [storage.settings.pixKey, storage.settings.ownerName]);

  const handleSave = async () => {
    await storage.updateSettings({ pixKey, ownerName });
    toast.success("Configurações salvas!");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 pb-24 safe-bottom">
        {/* Header */}
        <header className="flex items-center gap-3 pt-4 pb-6">
          <div>
            <h1 className="text-xl font-bold">Configurações</h1>
            <p className="text-sm text-muted-foreground">Chave PIX e dados pessoais</p>
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
                    <p className="text-xs text-muted-foreground">Incluída nas mensagens de cobrança</p>
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
                    <p className="text-xs text-muted-foreground">Aparece no final das mensagens</p>
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
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 rounded-xl font-semibold text-base gap-2"
              onClick={handleSave}
            >
              <Save className="size-4" />
              Salvar Configurações
            </Button>
          </motion.div>

          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-card/30 border-border/30 shadow-none">
              <CardContent className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <Info className="size-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground leading-relaxed">
                    <p className="mb-2">
                      Todos os dados são salvos no Convex e sincronizados em tempo real entre seus dispositivos.
                    </p>
                    <p>
                      Para acessar de outros dispositivos, basta abrir o app novamente - seus dados estarão lá!
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
            transition={{ delay: 0.25 }}
          >
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2 h-12"
              onClick={() => {
                if (confirm("Isso vai apagar TODOS os seus dados. Tem certeza?")) {
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
