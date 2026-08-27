import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Receipt,
  Users,
  MessageCircle,
  Key,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

const steps = [
  {
    icon: Receipt,
    title: "Bem-vindo ao Quem me Pagou! 💸",
    description: "Gerencie suas assinaturas compartiladas e acompanhe quem pagou cada mês.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Adicione Assinaturas",
    description: "Crie cards para Netflix, Spotify, ChatGPT e mais. Defina o valor total e quantas pessoas dividem.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Users,
    title: "Cadastre Pessoas",
    description: "Adicione os participantes com nome, telefone WhatsApp e valor da cota de cada um.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: MessageCircle,
    title: "Cobre via WhatsApp",
    description: "Com um toque, envie mensagens automáticas para quem está pendente com valor, PIX e economia.",
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    icon: Key,
    title: "Configure sua Chave PIX",
    description: "Cadastre sua chave PIX nas Configurações para incluí-la nas mensagens de cobrança e gerar QR Codes.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

export function Onboarding() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const dismissed = localStorage.getItem("qmp-onboarding-done");
    if (!dismissed) {
      // Show after a short delay
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem("qmp-onboarding-done", "true");
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!show) return null;

  const current = steps[step];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6"
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-sm"
        >
          <Card className="bg-card border-border/60 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              {/* Skip button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 z-10 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-surface transition-colors"
              >
                <X className="size-4" />
              </button>

              {/* Icon area */}
              <div className={`${current.bg} flex items-center justify-center py-10`}>
                <motion.div
                  key={step}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <Icon className={`size-12 ${current.color}`} />
                </motion.div>
              </div>

              {/* Content */}
              <div className="px-6 pt-6 pb-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h3 className="text-lg font-bold text-center mb-2">
                      {current.title}
                    </h3>
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {current.description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 pb-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step
                        ? "w-6 bg-primary"
                        : i < step
                        ? "w-1.5 bg-primary/40"
                        : "w-1.5 bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-3 px-6 pb-6">
                {step > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-10 rounded-xl"
                    onClick={handlePrev}
                  >
                    <ChevronLeft className="size-4" />
                    Voltar
                  </Button>
                ) : (
                  <div className="flex-1" />
                )}
                <Button
                  className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 shadow-sm"
                  onClick={handleNext}
                >
                  {step === steps.length - 1 ? (
                    "Começar! 🚀"
                  ) : (
                    <>
                      Próximo
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
