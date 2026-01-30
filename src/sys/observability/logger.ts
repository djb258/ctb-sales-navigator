/**
 * Logger — Sales Navigator
 *
 * Authority: CONSTITUTION.md
 * CC Layer: CC-04
 *
 * Structured logging for observability.
 * All logs include PID for traceability.
 */

const HUB_ID = 'HUB-SALES-NAV-20260130';

interface LogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  pid: string;
  hub_id: string;
  context: string;
  message: string;
  data?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

function createLogEntry(
  level: LogEntry['level'],
  context: string,
  message: string,
  data?: Record<string, unknown>,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    pid: (typeof process !== 'undefined' && process.env?.PID) || 'unknown',
    hub_id: HUB_ID,
    context,
    message,
  };

  if (data) entry.data = data;
  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return entry;
}

export const logger = {
  error: (context: string, message: string, data?: Record<string, unknown>, error?: Error) => {
    console.error(JSON.stringify(createLogEntry('ERROR', context, message, data, error)));
  },

  warn: (context: string, message: string, data?: Record<string, unknown>) => {
    console.warn(JSON.stringify(createLogEntry('WARN', context, message, data)));
  },

  info: (context: string, message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify(createLogEntry('INFO', context, message, data)));
  },

  debug: (context: string, message: string, data?: Record<string, unknown>) => {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
      console.debug(JSON.stringify(createLogEntry('DEBUG', context, message, data)));
    }
  },

  audit: (action: string, actor: string, resource: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify(createLogEntry('INFO', 'AUDIT', `${action} by ${actor} on ${resource}`, {
      action,
      actor,
      resource,
      ...data,
    })));
  },
};

export default logger;
