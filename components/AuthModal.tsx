"use client";

import React, { useState, useEffect } from "react";

type AuthMode = "signin" | "signup";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  signIn: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  signUp: (email: string, password: string) => Promise<{ error: { message: string } | null }>;
  authError: string | null;
  clearError: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  signIn,
  signUp,
  authError,
  clearError,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmail("");
      setPassword("");
      clearError();
    }
  }, [isOpen, mode, clearError]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearError();

    const { error } = mode === "signin"
      ? await signIn(email, password)
      : await signUp(email, password);

    setIsSubmitting(false);
    if (!error) {
      onSuccess();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-pokedex-gray/95 border-2 border-pokedex-blue-light/50 rounded-xl shadow-2xl overflow-hidden glow-blue"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-pokedex-blue to-pokedex-purple px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-tech text-white text-glow">
              {mode === "signin" ? "ENTRAR" : "CRIAR CONTA"}
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
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="auth-email" className="block text-sm font-mono text-pokedex-cyan mb-1">
              EMAIL
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-pokedex-dark/50 border border-pokedex-blue-light/30 rounded-lg text-white font-mono focus:outline-none focus:border-pokedex-blue-light"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label htmlFor="auth-password" className="block text-sm font-mono text-pokedex-cyan mb-1">
              SENHA
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2 bg-pokedex-dark/50 border border-pokedex-blue-light/30 rounded-lg text-white font-mono focus:outline-none focus:border-pokedex-blue-light"
              placeholder="••••••••"
            />
          </div>
          {authError && (
            <p className="text-red-400 text-sm font-mono">{authError}</p>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-pokedex-purple to-pokedex-blue-light rounded-lg font-bold font-tech text-white hover:opacity-90 transition-all disabled:opacity-50 glow-purple"
          >
            {isSubmitting ? "AGUARDE..." : mode === "signin" ? "ENTRAR" : "CRIAR CONTA"}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              clearError();
            }}
            className="w-full text-sm text-pokedex-cyan hover:text-pokedex-neon font-mono"
          >
            {mode === "signin"
              ? "Não tem conta? Criar conta"
              : "Já tem conta? Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
