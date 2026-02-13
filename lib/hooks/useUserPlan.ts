"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserPlan } from "@/lib/types";
import { PLAN_LIMITS, STORAGE_KEYS } from "@/lib/constants";
import { useSupabase } from "@/components/SupabaseProvider";

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDefaultPlan(): UserPlan {
  const today = getToday();
  return {
    plan: "free",
    activatedAt: today,
    dailyScans: 0,
    monthlyDescriptions: 0,
    lastResetDate: today,
    totalScanned: 0,
  };
}

function loadPlan(): UserPlan {
  if (typeof window === "undefined") return getDefaultPlan();
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_PLAN);
    if (!stored) return getDefaultPlan();
    const parsed = JSON.parse(stored) as UserPlan;
    return {
      plan: parsed.plan ?? "free",
      activatedAt: parsed.activatedAt ?? getToday(),
      dailyScans: parsed.dailyScans ?? 0,
      monthlyDescriptions: parsed.monthlyDescriptions ?? 0,
      lastResetDate: parsed.lastResetDate ?? getToday(),
      totalScanned: parsed.totalScanned ?? 0,
    };
  } catch {
    return getDefaultPlan();
  }
}

function savePlan(plan: UserPlan) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PLAN, JSON.stringify(plan));
  } catch (error) {
    console.error("Error saving user plan:", error);
  }
}

export function useUserPlan() {
  const { session, isLoading: authLoading } = useSupabase();
  const [planData, setPlanData] = useState<UserPlan>(getDefaultPlan());

  // Fetch plan from API when logged in
  useEffect(() => {
    if (authLoading) return;
    if (!session?.user) {
      setPlanData(loadPlan());
      return;
    }
    fetch("/api/user/plan")
      .then((res) => res.json())
      .then((data) => {
        setPlanData((prev) => ({
          ...prev,
          plan: data.plan as "free" | "pro",
        }));
      })
      .catch(() => setPlanData(loadPlan()));
  }, [session?.user?.id, authLoading]);

  // For anonymous users, load from localStorage on mount
  useEffect(() => {
    if (!session && !authLoading) {
      setPlanData(loadPlan());
    }
  }, [session, authLoading]);

  const persist = useCallback((next: UserPlan) => {
    setPlanData(next);
    savePlan(next);
  }, []);

  useEffect(() => {
    const today = getToday();
    const [currentYear, currentMonth] = today.split("-");
    const [lastYear, lastMonth, lastDay] = planData.lastResetDate.split("-");

    const dayChanged = planData.lastResetDate !== today;
    const monthChanged = currentYear !== lastYear || currentMonth !== lastMonth;

    if (!dayChanged && !monthChanged) return;

    const next: UserPlan = {
      ...planData,
      lastResetDate: today,
      dailyScans: dayChanged ? 0 : planData.dailyScans,
      monthlyDescriptions: monthChanged ? 0 : planData.monthlyDescriptions,
    };
    persist(next);
  }, [planData.lastResetDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPlan = useCallback(() => planData, [planData]);
  const isPro = useCallback(() => planData.plan === "pro", [planData.plan]);

  const getUsage = useCallback(
    () => ({
      dailyScans: planData.dailyScans,
      monthlyDescriptions: planData.monthlyDescriptions,
      totalScanned: planData.totalScanned,
    }),
    [planData.dailyScans, planData.monthlyDescriptions, planData.totalScanned]
  );

  const limits = planData.plan === "pro" ? PLAN_LIMITS.PRO : PLAN_LIMITS.FREE;

  const canScan = useCallback(
    (totalScannedCount: number) => {
      if (planData.plan === "pro") return true;
      return (
        planData.dailyScans < limits.DAILY_SCANS &&
        totalScannedCount < limits.TOTAL_SCANNED
      );
    },
    [planData.plan, planData.dailyScans, limits]
  );

  const canGenerateDescription = useCallback(() => {
    if (planData.plan === "pro") return true;
    return planData.monthlyDescriptions < limits.MONTHLY_DESCRIPTIONS;
  }, [planData.plan, planData.monthlyDescriptions, limits]);

  const canAccessPokemon = useCallback(
    (id: number) => id <= limits.MAX_POKEMON_ID,
    [limits]
  );

  const incrementUsage = useCallback(
    (type: "scan" | "description") => {
      if (planData.plan === "pro") return;
      const next: UserPlan = { ...planData };
      if (type === "scan") next.dailyScans += 1;
      if (type === "description") next.monthlyDescriptions += 1;
      persist(next);
    },
    [planData, persist]
  );

  const refetchPlan = useCallback(async () => {
    if (!session?.user) return;
    const res = await fetch("/api/user/plan");
    const data = await res.json();
    setPlanData((prev) => ({
      ...prev,
      plan: data.plan as "free" | "pro",
    }));
  }, [session?.user?.id]);

  const scansRemaining = planData.plan === "pro" 
    ? Infinity 
    : Math.max(0, limits.DAILY_SCANS - planData.dailyScans);

  const descriptionsRemaining = planData.plan === "pro"
    ? Infinity
    : Math.max(0, limits.MONTHLY_DESCRIPTIONS - planData.monthlyDescriptions);

  return {
    getPlan,
    isPro,
    getUsage,
    canScan,
    canGenerateDescription,
    canAccessPokemon,
    incrementUsage,
    refetchPlan,
    planData,
    limits,
    scansRemaining,
    descriptionsRemaining,
  };
}
