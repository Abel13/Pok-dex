"use client";

import React, { useEffect } from "react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage?: {
    dailyScans: number;
    monthlyDescriptions: number;
    totalScanned: number;
  };
}

const LIMITS = {
  dailyScans: 10,
  totalScanned: 50,
  monthlyDescriptions: 20,
};

export default function UpgradeModal({
  isOpen,
  onClose,
  usage = { dailyScans: 0, monthlyDescriptions: 0, totalScanned: 0 },
}: UpgradeModalProps) {
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

  const buymeacoffeeUsername = process.env.NEXT_PUBLIC_BUYMECOFFEE_USERNAME;
  const donateUrl = buymeacoffeeUsername
    ? `https://www.buymeacoffee.com/${buymeacoffeeUsername}`
    : null;

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
              LIMITE ATINGIDO
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
            Você atingiu o limite de uso. Apoie o projeto para nos ajudar a manter o app.
          </p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-pokedex-dark/50 rounded-lg p-4 border border-pokedex-blue-light/20">
            <h3 className="text-sm font-semibold text-pokedex-cyan mb-3">SEU USO ATUAL</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span>Identificações hoje:</span>
                <span>{usage.dailyScans}/{LIMITS.dailyScans}</span>
              </div>
              <div className="flex justify-between">
                <span>Pokémon escaneados:</span>
                <span>{usage.totalScanned}/{LIMITS.totalScanned}</span>
              </div>
              <div className="flex justify-between">
                <span>Descrições este mês:</span>
                <span>{usage.monthlyDescriptions}/{LIMITS.monthlyDescriptions}</span>
              </div>
            </div>
          </div>

          {donateUrl ? (
            <a
              href={donateUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="block w-full"
            >
              <img
                src={`https://img.buymeacoffee.com/button-api/?text=Apoie o projeto&slug=${buymeacoffeeUsername}&button_colour=5F7FFF&font_colour=ffffff`}
                alt="Buy Me a Coffee"
                className="w-full h-auto rounded-lg hover:opacity-90 transition-opacity"
              />
            </a>
          ) : (
            <p className="text-sm text-gray-400 text-center">
              O botão de doação será exibido quando NEXT_PUBLIC_BUYMECOFFEE_USERNAME estiver configurado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
