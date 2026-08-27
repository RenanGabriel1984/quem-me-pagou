# 💰 Quem me Pagou?

**PWA para gerenciar assinaturas compartilhadastack**

Gerencie suas assinaturas de streaming, software e cursos divididos entre amigos. Acompanhe quem pagou, quem está pendente, e quanto cada pessoa economiza ao dividir o plano.

## ✨ Funcionalidades

- **Dashboard** — Visão geral das assinaturas com cards de resumo (pago, pendente, economia gerada)
- **Gestão de Pessoas** — Adicione participantes com nome, telefone WhatsApp e valor da cota
- **Status de Pagamento** — Marque quem pagou e quem está pendente no mês atual
- **Acúmulo de Débitos** — Sistema de mensalidade com contagem de meses em aberto
- **WhatsApp Cobrança** — Envie mensagens pré-formatadas via WhatsApp com valor, chave PIX e economia
- **PIX Copia e Cola** — Copie a chave PIX ou gere QR Code para facilitar o pagamento
- **Economia do Grupo** — Acompanhe quanto cada pessoa e o grupo inteiro economizou
- **Comparativo de Preços** — Veja o preço individual vs. preço do grupo
- **Reset Mensal** — "Virar o mês" para resetar pagamentos e acumular débitos
- **PWA Instalável** — Instale na tela inicial do celular como um app nativo
- **Modo Claro/Escuro** — Tema personalizável com persistência

## 🛠 Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Estilo | Tailwind CSS 4 + shadcn/ui |
| Animações | Framer Motion |
| Backend | Convex (queries e mutations em tempo real) |
| PWA | Service Worker + Web App Manifest |

## 🚀 Início Rápido

```bash
# Instale as dependências
bun install

# Inicie o desenvolvimento
bun run dev
```

O app estará disponível em `http://localhost:5173`.

## 📁 Estrutura

```
src/
├── components/        # Componentes reutilizáveis
│   ├── ui/           # shadcn/ui primitives
│   ├── AppHeader.tsx  # Header fixo com menu hambúrguer
│   ├── PWAInstallBanner.tsx  # Banner de instalação PWA
│   ├── PixDisplay.tsx # Botões PIX (copiar + QR Code)
│   ├── Skeleton.tsx   # Esqueletos de carregamento
│   └── ThemeProvider.tsx # Gerenciamento de tema
├── convex/           # Backend Convex
│   ├── schema.ts     # Schema do banco de dados
│   ├── subscriptions.ts  # CRUD de assinaturas
│   ├── people.ts     # CRUD de participantes + reset mensal
│   ├── settings.ts   # Configurações do usuário
│   └── seed.ts       # Dados de exemplo
├── hooks/
│   └── use-storage.ts # Hook principal (reactive queries)
├── pages/
│   ├── Landing.tsx    # Página inicial
│   ├── Dashboard.tsx  # Dashboard principal
│   ├── SubscriptionDetail.tsx # Detalhe da assinatura
│   └── Settings.tsx   # Configurações
├── types/
│   └── data.ts        # Tipos TypeScript e helpers
├── App.tsx            # Roteamento
├── main.tsx           # Entry point
└── index.css          # Tokens de tema (dark/light)
```

## 📱 Instalação PWA

1. Abra o app no navegador do celular
2. Clique no banner "Instalar App" ou use o menu do navegador
3. Confirme a instalação
4. O app aparecerá na tela inicial como um aplicativo nativo

## 🔒 Dados

Todos os dados são armazenados no **Convex** e sincronizados em tempo real entre dispositivos. Não é necessário criar conta — basta abrir o app e começar a usar.

---

Desenvolvido com 💚 usando React + Convex
