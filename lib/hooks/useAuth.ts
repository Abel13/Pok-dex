"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSupabase } from "@/components/SupabaseProvider";

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
        setAuthError(error.message);
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
        setAuthError(error.message);
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
