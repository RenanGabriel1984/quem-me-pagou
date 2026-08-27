"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

const GITHUB_API = "https://api.github.com";

function getHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "GITHUB_TOKEN não configurado. Adicione sua chave nas Configurações.",
    );
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

/**
 * Backup all app data to a GitHub Gist.
 * Creates a new gist or updates an existing one (by gistId).
 */
export const backupToGist = action({
  args: {
    subscriptions: v.any(),
    people: v.any(),
    settings: v.any(),
    gistId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const headers = getHeaders();

    const backupData = {
      version: 1,
      createdAt: new Date().toISOString(),
      subscriptions: args.subscriptions,
      people: args.people,
      settings: args.settings,
    };

    const files: Record<string, { content: string }> = {
      "quem-me-pagou-backup.json": {
        content: JSON.stringify(backupData, null, 2),
      },
    };

    let result: { id: string; html_url: string };

    if (args.gistId) {
      // Update existing gist
      const res = await fetch(`${GITHUB_API}/gists/${args.gistId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          description: `Quem me Pagou? - Backup (${new Date().toLocaleDateString("pt-BR")})`,
          files,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          `Erro ao atualizar gist: ${err.message || res.statusText}`,
        );
      }

      result = await res.json();
    } else {
      // Create new gist
      const res = await fetch(`${GITHUB_API}/gists`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          description: `Quem me Pagou? - Backup (${new Date().toLocaleDateString("pt-BR")})`,
          public: false,
          files,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(
          `Erro ao criar gist: ${err.message || res.statusText}`,
        );
      }

      result = await res.json();
    }

    return {
      gistId: result.id,
      htmlUrl: result.html_url,
      message: "Backup realizado com sucesso!",
    };
  },
});

/**
 * Restore data from a GitHub Gist.
 */
export const restoreFromGist = action({
  args: {
    gistId: v.string(),
  },
  handler: async (ctx, args) => {
    const headers = getHeaders();

    const res = await fetch(`${GITHUB_API}/gists/${args.gistId}`, {
      headers,
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Gist não encontrado. Verifique o ID.");
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `Erro ao buscar gist: ${err.message || res.statusText}`,
      );
    }

    const gist = await res.json();
    const file = gist.files?.["quem-me-pagou-backup.json"];

    if (!file) {
      throw new Error(
        "Arquivo de backup não encontrado neste gist. Verifique se é um backup válido do Quem me Pagou?.",
      );
    }

    const backupData = JSON.parse(file.content);

    if (!backupData.version || !backupData.subscriptions) {
      throw new Error(
        "Formato de backup inválido. Verifique se é um backup válido do Quem me Pagou?.",
      );
    }

    return {
      data: {
        subscriptions: backupData.subscriptions,
        people: backupData.people,
        settings: backupData.settings,
      },
      createdAt: backupData.createdAt,
      message: "Dados restaurados com sucesso!",
    };
  },
});
