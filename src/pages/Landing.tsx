import { motion } from "framer-motion";
import { ArrowRight, Shield, Smartphone, Zap, Receipt, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const features = [
  {
    icon: Receipt,
    title: "Gerencie Assinaturas",
    description: "Netflix, Spotify, ChatGPT — tudo organizado em um só lugar.",
  },
  {
    icon: Users,
    title: "Controle de Cotas",
    description: "Adicione pessoas e acompanhe quem pagou cada mês.",
  },
  {
    icon: MessageCircle,
    title: "Cobrança via WhatsApp",
    description: "Envie lembretes automáticos com um toque para quem está pendente.",
  },
  {
    icon: Shield,
    title: "Dados Locais",
    description: "Tudo salvo no seu navegador. Sem cadastro, sem servidor.",
  },
];

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-primary/8 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 pt-20 pb-16 md:pt-32 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            {/* Logo / Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
              <span className="text-lg">💰</span>
              <span className="text-sm font-medium text-primary">PWA • Sem cadastro necessário</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Quem me
              <span className="text-primary"> pagou?</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Gerencie suas assinaturas compartiladas e acompanhe em tempo real
              quem realizou o pagamento. Simples, rápido, no seu bolso.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8 h-12 rounded-xl font-semibold shadow-lg shadow-primary/20"
                onClick={() => navigate("/dashboard")}
              >
                Abrir Dashboard
                <ArrowRight className="size-5" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground text-base h-12"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Ver funcionalidades
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-4xl mx-auto px-6 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group relative rounded-2xl border border-border/60 bg-card/50 p-6 transition-all hover:border-primary/30 hover:bg-card"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 flex items-center justify-center size-11 rounded-xl bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                  <f.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8"
        >
          {[
            { value: "100%", label: "Grátis" },
            { value: "Local", label: "Privado" },
            { value: "PWA", label: "Instalável" },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-4 rounded-xl bg-card/30 border border-border/40">
              <div className="text-xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            💚 Feito com carinho para quem divide assinaturas.
          </p>
        </div>
      </footer>
    </div>
  );
}
