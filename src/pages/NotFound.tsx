import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-background"
    >
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Background gradient */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        </div>

        <div className="relative text-center max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          >
            <p className="text-8xl font-bold text-primary/20 mb-4">404</p>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-2xl font-bold text-foreground mb-2">
              Página não encontrada
            </p>
            <p className="text-muted-foreground mb-8">
              Ops! Esta página não existe ou foi movida. Volte para o dashboard e tente novamente.
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-3"
          >
            <Button
              variant="outline"
              className="gap-2 h-12 rounded-xl min-w-[44px]"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
            <Button
              className="gap-2 h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              onClick={() => navigate("/dashboard")}
            >
              <Home className="size-4" />
              Dashboard
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6">
        <p className="text-xs text-muted-foreground/50">
          💸 Quem me Pagou?
        </p>
      </div>
    </motion.div>
  );
}
