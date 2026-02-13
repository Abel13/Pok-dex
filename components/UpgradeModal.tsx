"use client";

import React, { useEffect, useState } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  onOpenAuth: () => void;
  usage?: {
    dailyScans: number;
    monthlyDescriptions: number;
    totalScanned: number;
  };
}

const FREE_LIMITS = {
  dailyScans: 10,
  totalScanned: 50,
  monthlyDescriptions: 20,
  maxPokemonId: 151,
};

export default function UpgradeModal({
  isOpen,
  onClose,
  isLoggedIn,
  onOpenAuth,
  usage = { dailyScans: 0, monthlyDescriptions: 0, totalScanned: 0 },
}: UpgradeModalProps) {
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!isLoggedIn) {
      onClose();
      onOpenAuth();
      return;
    }

    setIsRedirecting(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Erro ao criar sessão de pagamento");
      }
    } catch (err) {
      console.error(err);
      setIsRedirecting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-4 bg-pokedex-gray/95 border-2 border-pokedex-blue-light/50 rounded-xl shadow-2xl overflow-hidden glow-blue"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pokedex-blue to-pokedex-purple px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-tech text-white text-glow">
              UPGRADE TO PRO
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              aria-label="Fechar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-pokedex-cyan mt-1">
            Desbloqueie todas as funcionalidades
          </p>
        </div>

        <div className="p-6 space-y-6">
          {!isLoggedIn && (
            <div className="bg-amber-900/30 border border-amber-500/50 rounded-lg p-4">
              <p className="text-amber-200 text-sm font-mono">
                Entre ou crie uma conta para fazer upgrade e concluir o pagamento.
              </p>
            </div>
          )}

          <div className="bg-pokedex-dark/50 rounded-lg p-4 border border-pokedex-blue-light/20">
            <h3 className="text-sm font-semibold text-pokedex-cyan mb-3">SEU USO ATUAL</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span>Identificações hoje:</span>
                <span>{usage.dailyScans}/{FREE_LIMITS.dailyScans}</span>
              </div>
              <div className="flex justify-between">
                <span>Pokémon escaneados:</span>
                <span>{usage.totalScanned}/{FREE_LIMITS.totalScanned}</span>
              </div>
              <div className="flex justify-between">
                <span>Descrições este mês:</span>
                <span>{usage.monthlyDescriptions}/{FREE_LIMITS.monthlyDescriptions}</span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-pokedex-blue-light/30">
                  <th className="text-left py-2 text-pokedex-cyan">Recurso</th>
                  <th className="text-center py-2 text-gray-400">FREE</th>
                  <th className="text-center py-2 text-pokedex-neon">PRO</th>
                </tr>
              </thead>
              <tbody className="text-gray-300">
                <tr className="border-b border-pokedex-blue-light/10">
                  <td className="py-2">Identificações/dia</td>
                  <td className="text-center py-2">10</td>
                  <td className="text-center py-2 text-pokedex-neon">∞</td>
                </tr>
                <tr className="border-b border-pokedex-blue-light/10">
                  <td className="py-2">Pokémon escaneados</td>
                  <td className="text-center py-2">50</td>
                  <td className="text-center py-2 text-pokedex-neon">∞</td>
                </tr>
                <tr className="border-b border-pokedex-blue-light/10">
                  <td className="py-2">Descrições/mês</td>
                  <td className="text-center py-2">20</td>
                  <td className="text-center py-2 text-pokedex-neon">∞</td>
                </tr>
                <tr>
                  <td className="py-2">Regiões</td>
                  <td className="text-center py-2">Kanto (151)</td>
                  <td className="text-center py-2 text-pokedex-neon">Todas</td>
                </tr>
              </tbody>
            </table>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isRedirecting}
            className="w-full py-3 px-4 bg-gradient-to-r from-pokedex-purple to-pokedex-blue-light rounded-lg font-bold font-tech text-white hover:opacity-90 transition-all disabled:opacity-50 glow-purple"
          >
            {isRedirecting
              ? "REDIRECIONANDO..."
              : !isLoggedIn
                ? "ENTRAR PARA CONTINUAR"
                : "UPGRADE TO PRO"}
          </button>
        </div>
      </div>
    </div>
  );
}
