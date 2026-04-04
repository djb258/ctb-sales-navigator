/**
 * Tracing — Sales Navigator
 *
 * Authority: CONSTITUTION.md
 * CC Layer: CC-04
 *
 * Process ID generation and trace propagation.
 * PID Pattern: SALES-NAV-{TIMESTAMP}-{RANDOM_HEX}
 */

/**
 * Generate a unique Process ID for tracing
 */
export function generatePID(): string {
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0];
  const random = Math.random().toString(16).substring(2, 10);
  return `SALES-NAV-${timestamp}-${random}`;
}

/**
 * Execute a function with a PID set in the environment
 */
export function withPID<T>(fn: (pid: string) => T): T {
  const pid = generatePID();

  if (typeof process !== 'undefined' && process.env) {
    const previousPID = process.env.PID;
    process.env.PID = pid;
    try {
      return fn(pid);
    } finally {
      if (previousPID) {
        process.env.PID = previousPID;
      } else {
        delete process.env.PID;
      }
    }
  }

  return fn(pid);
}

/**
 * Execute an async function with a PID set in the environment
 */
export async function withPIDAsync<T>(fn: (pid: string) => Promise<T>): Promise<T> {
  const pid = generatePID();

  if (typeof process !== 'undefined' && process.env) {
    const previousPID = process.env.PID;
    process.env.PID = pid;
    try {
      return await fn(pid);
    } finally {
      if (previousPID) {
        process.env.PID = previousPID;
      } else {
        delete process.env.PID;
      }
    }
  }

  return fn(pid);
}

/**
 * Get the current PID from environment
 */
export function getCurrentPID(): string {
  if (typeof process !== 'undefined' && process.env?.PID) {
    return process.env.PID;
  }
  return 'unknown';
}
