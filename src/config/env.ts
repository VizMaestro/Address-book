/**
 * Centralised environment config.
 * All process.env reads live here — components and services never access process.env directly.
 * Validation happens at call time (inside API functions), not at module load time,
 * so the build does not fail when .env.local is absent.
 */

function readEnv(key: string): string {
  return process.env[key] ?? "";
}

export const env = {
  get apiBaseUrl(): string {
    return readEnv("API_BASE_URL");
  },
  get apiToken(): string {
    return readEnv("API_TOKEN");
  },
} as const;
