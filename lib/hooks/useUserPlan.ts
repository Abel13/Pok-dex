"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserPlan } from "@/lib/types";
import { PLAN_LIMITS, STORAGE_KEYS } from "@/lib/constants";
import { useSupabase } from "@/components/SupabaseProvider";

const LIMITS = PLAN_LIMITS.FREE;

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
      plan: "free",
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

  const persist = useCallback((next: UserPlan) => {
    setPlanData(next);
    savePlan(next);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.user) {
      setPlanData(loadPlan());
      return;
    }
    fetch("/api/user/usage")
      .then((res) => res.json())
      .then((data) => {
        setPlanData((prev) => ({
          ...prev,
          plan: "free",
          dailyScans: data.dailyScans ?? prev.dailyScans,
          monthlyDescriptions: data.monthlyDescriptions ?? prev.monthlyDescriptions,
          totalScanned: data.totalScanned ?? prev.totalScanned,
        }));
      })
      .catch(() => setPlanData(loadPlan()));
  }, [session?.user?.id, authLoading]);

  useEffect(() => {
    if (!session && !authLoading) {
      setPlanData(loadPlan());
    }
  }, [session, authLoading]);

  useEffect(() => {
    const today = getToday();
    if (planData.lastResetDate !== today) {
      persist({
        ...planData,
        lastResetDate: today,
        dailyScans: 0,
      });
    }
  }, [planData.lastResetDate]); // eslint-disable-line react-hooks/exhaustive-deps

  const getPlan = useCallback(() => planData, [planData]);
  const isPro = useCallback(() => false, []);

  const getUsage = useCallback(
    () => ({
      dailyScans: planData.dailyScans,
      monthlyDescriptions: planData.monthlyDescriptions,
      totalScanned: planData.totalScanned,
    }),
    [planData.dailyScans, planData.monthlyDescriptions, planData.totalScanned]
  );

  const updateUsageFromServer = useCallback(
    (usage: { dailyScans?: number; totalScanned?: number; monthlyDescriptions?: number }) => {
      setPlanData((prev) => {
        const next = { ...prev };
        if (usage.dailyScans !== undefined) next.dailyScans = usage.dailyScans;
        if (usage.totalScanned !== undefined) next.totalScanned = usage.totalScanned;
        if (usage.monthlyDescriptions !== undefined)
          next.monthlyDescriptions = usage.monthlyDescriptions;
        savePlan(next);
        return next;
      });
    },
    []
  );

  const canScan = useCallback(
    (_totalScannedCount: number) =>
      planData.dailyScans < LIMITS.DAILY_SCANS &&
      planData.totalScanned < LIMITS.TOTAL_SCANNED,
    [planData.dailyScans, planData.totalScanned]
  );

  const canGenerateDescription = useCallback(
    () => planData.monthlyDescriptions < LIMITS.MONTHLY_DESCRIPTIONS,
    [planData.monthlyDescriptions]
  );

  const canAccessPokemon = useCallback((_id: number) => true, []);

  const incrementUsage = useCallback(
    (type: "scan" | "description") => {
      const next: UserPlan = { ...planData };
      if (type === "scan") {
        next.dailyScans += 1;
        next.totalScanned += 1;
      } else {
        next.monthlyDescriptions += 1;
      }
      persist(next);
    },
    [planData, persist]
  );

  const refetchPlan = useCallback(async () => {
    if (!session?.user) return;
    const res = await fetch("/api/user/usage");
    const data = await res.json();
    setPlanData((prev) => ({
      ...prev,
      dailyScans: data.dailyScans ?? prev.dailyScans,
      monthlyDescriptions: data.monthlyDescriptions ?? prev.monthlyDescriptions,
      totalScanned: data.totalScanned ?? prev.totalScanned,
    }));
  }, [session?.user?.id]);

  const scansRemaining = Math.max(0, LIMITS.DAILY_SCANS - planData.dailyScans);
  const descriptionsRemaining = Math.max(
    0,
    LIMITS.MONTHLY_DESCRIPTIONS - planData.monthlyDescriptions
  );

  return {
    getPlan,
    isPro,
    getUsage,
    canScan,
    canGenerateDescription,
    canAccessPokemon,
    incrementUsage,
    updateUsageFromServer,
    refetchPlan,
    planData,
    limits: LIMITS,
    scansRemaining,
    descriptionsRemaining,
  };
}
