"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/components/SupabaseProvider";

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (normalized.includes("user already registered")) return "Este e-mail já está cadastrado.";
  if (normalized.includes("password should be")) return "A senha deve ter pelo menos 6 caracteres.";
  if (normalized.includes("rate limit")) return "Muitas tentativas. Aguarde um momento e tente novamente.";
  return "Não foi possível concluir a autenticação. Tente novamente.";
}

export function useAuth() {
  const { user, session, isLoading } = useSupabase();
  const [authError, setAuthError] = useState<string | null>(null);

  const signIn = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      const supabase = createClient();
      if (!supabase) {
        setAuthError("Supabase não configurado");
        return { error: { message: "Supabase não configurado" } };
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setAuthError(translateAuthError(error.message));
        return { error };
      }
      return { error: null };
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      setAuthError(null);
      const supabase = createClient();
      if (!supabase) {
        setAuthError("Supabase não configurado");
        return { error: { message: "Supabase não configurado" } };
      }
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(translateAuthError(error.message));
        return { error };
      }
      return { error: null };
    },
    []
  );

  const signOut = useCallback(async () => {
    setAuthError(null);
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
  }, []);

  const clearError = useCallback(() => setAuthError(null), []);

  return {
    user,
    session,
    isLoading,
    isLoggedIn: !!session,
    signIn,
    signUp,
    signOut,
    authError,
    clearError,
  };
}
