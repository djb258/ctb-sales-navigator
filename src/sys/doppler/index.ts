/**
 * Doppler Integration — Sales Navigator
 *
 * Authority: CONSTITUTION.md (Doppler Mandate)
 * CC Layer: CC-02 (Hub Infrastructure)
 *
 * All secrets are injected by Doppler at runtime.
 * Never hardcode secrets. Never read from .env files.
 *
 * Usage:
 *   doppler run -- npm run dev
 *   doppler run -- npm run build
 */

/**
 * Get a required environment variable.
 * Throws if the variable is not set (Doppler should inject it).
 */
export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Ensure you are running with Doppler: doppler run -- <command>`
    );
  }
  return value;
}

/**
 * Get an optional environment variable with a default.
 */
export function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

/**
 * Hub identity from Doppler/REGISTRY.yaml
 */
export const HUB_ID = getOptionalEnv('HUB_ID', 'HUB-SALES-NAV-20260130');
export const HUB_NAME = getOptionalEnv('HUB_NAME', 'sales-navigator');

/**
 * Validate that Doppler has injected required secrets.
 * Call this at application startup.
 */
export function validateDopplerSecrets(): void {
  const required = [
    'COMPOSIO_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('╔════════════════════════════════════════════════════════════╗');
    console.error('║  DOPPLER MANDATE VIOLATION                                  ║');
    console.error('╠════════════════════════════════════════════════════════════╣');
    console.error('║  Missing required secrets:                                  ║');
    missing.forEach(key => {
      console.error(`║    - ${key.padEnd(50)}║`);
    });
    console.error('║                                                            ║');
    console.error('║  Run with Doppler:                                         ║');
    console.error('║    doppler run -- npm run dev                              ║');
    console.error('╚════════════════════════════════════════════════════════════╝');

    throw new Error(`Missing Doppler secrets: ${missing.join(', ')}`);
  }

  console.log('✓ Doppler secrets validated');
}
