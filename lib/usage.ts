import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLAN_LIMITS } from "@/lib/constants";

const LIMITS = PLAN_LIMITS.FREE;

function getIdentifier(userId: string | null, ip: string): string {
  if (userId) return `user:${userId}`;
  const hash = createHash("sha256").update(ip || "unknown").digest("hex");
  return `ip:${hash}`;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export interface UsageState {
  dailyScans: number;
  totalScanned: number;
  monthlyDescriptions: number;
}

export async function getAndValidateUsage(
  request: Request,
  userId: string | null,
  type: "scan" | "description"
): Promise<{ ok: true; usage: UsageState } | { ok: false; error: string; code: string }> {
  const ip = getClientIp(request);
  const identifier = getIdentifier(userId, ip);
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);

  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("usage")
    .select("last_date, daily_scans, total_scanned, last_month, monthly_descriptions")
    .eq("identifier", identifier)
    .single();

  let dailyScans = row?.daily_scans ?? 0;
  let totalScanned = row?.total_scanned ?? 0;
  let monthlyDescriptions = row?.monthly_descriptions ?? 0;
  const lastDate = row?.last_date ?? today;
  const lastMonth = row?.last_month ?? currentMonth;

  if (lastDate !== today) {
    dailyScans = 0;
  }
  if (lastMonth !== currentMonth) {
    monthlyDescriptions = 0;
  }

  if (type === "scan") {
    if (dailyScans >= LIMITS.DAILY_SCANS) {
      return {
        ok: false,
        error: "Limite diário de identificações atingido. Apoie o projeto para continuar.",
        code: "DAILY_LIMIT",
      };
    }
    if (totalScanned >= LIMITS.TOTAL_SCANNED) {
      return {
        ok: false,
        error: "Limite de Pokémon escaneados atingido. Apoie o projeto para continuar.",
        code: "TOTAL_LIMIT",
      };
    }
  } else {
    if (monthlyDescriptions >= LIMITS.MONTHLY_DESCRIPTIONS) {
      return {
        ok: false,
        error: "Limite mensal de descrições atingido. Apoie o projeto para continuar.",
        code: "MONTHLY_LIMIT",
      };
    }
  }

  return {
    ok: true,
    usage: {
      dailyScans,
      totalScanned,
      monthlyDescriptions,
    },
  };
}

export async function incrementUsage(
  userId: string | null,
  ip: string,
  type: "scan" | "description"
): Promise<UsageState> {
  const identifier = getIdentifier(userId, ip);
  const today = new Date().toISOString().slice(0, 10);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const now = new Date().toISOString();

  const supabase = createAdminClient();

  const { data: row } = await supabase
    .from("usage")
    .select("last_date, daily_scans, total_scanned, last_month, monthly_descriptions")
    .eq("identifier", identifier)
    .single();

  let dailyScans = row?.daily_scans ?? 0;
  let totalScanned = row?.total_scanned ?? 0;
  let monthlyDescriptions = row?.monthly_descriptions ?? 0;
  let lastDate = row?.last_date ?? today;
  let lastMonth = row?.last_month ?? currentMonth;

  if (lastDate !== today) {
    dailyScans = 0;
    lastDate = today;
  }
  if (lastMonth !== currentMonth) {
    monthlyDescriptions = 0;
    lastMonth = currentMonth;
  }

  if (type === "scan") {
    dailyScans += 1;
    totalScanned += 1;
  } else {
    monthlyDescriptions += 1;
  }

  await supabase.from("usage").upsert(
    {
      identifier,
      last_date: lastDate,
      daily_scans: dailyScans,
      total_scanned: totalScanned,
      last_month: lastMonth,
      monthly_descriptions: monthlyDescriptions,
      updated_at: now,
    },
    { onConflict: "identifier" }
  );

  return { dailyScans, totalScanned, monthlyDescriptions };
}
