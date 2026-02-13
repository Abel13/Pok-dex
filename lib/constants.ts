export const PLAN_LIMITS = {
  FREE: {
    DAILY_SCANS: 10,
    TOTAL_SCANNED: 50,
    MONTHLY_DESCRIPTIONS: 20,
  },
} as const;

export const STORAGE_KEYS = {
  USER_PLAN: "pokedex_user_plan",
} as const;
