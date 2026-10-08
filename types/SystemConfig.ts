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
   * Early-start override. 'unlocked' opens the launch window immediately,
   * even if launch_date is still in the future. 'locked' defers to launch_date.
   */
  status: "locked" | "unlocked";
  /**
   * ISO 8601 UTC datetime for the FE countdown. When status is 'locked',
   * the window opens locally once this time is reached — no BE write required.
   */
  launch_date: string | null;
};

export type SystemConfig = {
  feature_flags: FeatureFlags;
  app_status: AppStatus;
};
