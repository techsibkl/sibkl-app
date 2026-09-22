import { SystemConfig } from "@/types/SystemConfig";
import { apiEndpoints } from "@/utils/endpoints";
import { secureFetch } from "@/utils/secureFetch";

/**
 * Fetches the current system config (feature flags + app launch status)
 * from GET /system/config.
 *
 * Returns null on network failure so callers can apply safe defaults.
 */
export const getSystemConfig = async (): Promise<SystemConfig | null> => {
  try {
    const response = await secureFetch(apiEndpoints.system.getConfig, {
      method: "GET",
    });
    const json = await response.json();
    if (json.success && json.data) {
      return json.data as SystemConfig;
    }
    console.warn("[getSystemConfig] Unexpected response:", json);
    return null;
  } catch (error) {
    console.error("[getSystemConfig] Failed:", error);
    return null;
  }
};
