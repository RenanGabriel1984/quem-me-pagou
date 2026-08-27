import { useState } from "react";
import { Menu, X, Sun, Moon, Settings, Home, RotateCcw } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Link, useLocation } from "react-router";
import { useStorage } from "../hooks/use-storage";

export function AppHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const { resetMonthlyPayments } = useStorage();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <>
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="flex h-14 items-center justify-between px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl">💸</span>
            <span className="text-base font-bold tracking-tight text-foreground">
              Quem me Pagou?
            </span>
          </Link>
          <button
            onClick={() => setDrawerOpen(true)}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-[70] h-full w-72 transform bg-background shadow-2xl transition-transform duration-300 ease-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="text-base font-bold text-foreground">Menu</span>
            <button
              onClick={() => setDrawerOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setDrawerOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Reset Monthly Payments */}
            <button
              onClick={async () => {
                if (window.confirm("Tem certeza que deseja virar o mês? Isso irá atualizar o status de pagamento de todos os participantes.")) {
                  await resetMonthlyPayments();
                  setDrawerOpen(false);
                }
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-amber-500/10 hover:text-amber-400"
            >
              <RotateCcw className="h-4.5 w-4.5" />
              Virar o Mês
            </button>
          </nav>

          {/* Theme Toggle */}
          <div className="border-t border-border px-3 py-4">
            <button
              onClick={toggleTheme}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="h-4.5 w-4.5" />
                  Modo Claro ☀️
                </>
              ) : (
                <>
                  <Moon className="h-4.5 w-4.5" />
                  Modo Escuro 🌙
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
