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
};

export type SystemConfig = {
  feature_flags: FeatureFlags;
  app_status: AppStatus;
};
