/**
 * Feature flags as returned by GET /system/config.
 * Keys match the `key` column in app_feature_flags (camelCase).
 * All flags default to false on the client while the config is loading.
 */
export type FeatureFlags = {
  people: boolean;
  guestFollowUp: boolean;
  leadersPage: boolean;
  cells: boolean;
  cellFollowUp: boolean;
  cellAttendance: boolean;
  events: boolean;
};

export type AppStatus = {
  /** Bump this string in the DB to trigger a one-time launch animation + onboarding. */
  launch_version: string;
  description: string | null;
  /**
   * Primary BE override for the lock/unlock banner.
   * 'locked'   = show locked state regardless of feature flags or countdown.
   * 'unlocked' = show unlocked celebration (overrides a not-yet-expired countdown).
   */
  status: "locked" | "unlocked";
  /** ISO 8601 UTC datetime string for the FE countdown timer. null = no countdown. */
  launch_date: string | null;
};

export type SystemConfig = {
  feature_flags: FeatureFlags;
  app_status: AppStatus;
};
