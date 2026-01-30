/**
 * Metrics — Sales Navigator
 *
 * Authority: CONSTITUTION.md
 * CC Layer: CC-04
 *
 * Application metrics for observability.
 */

interface MetricEntry {
  type: 'metric';
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp: string;
}

function emitMetric(name: string, value: number, labels?: Record<string, string>): void {
  const entry: MetricEntry = {
    type: 'metric',
    name,
    value,
    labels,
    timestamp: new Date().toISOString(),
  };
  console.log(JSON.stringify(entry));
}

export const metrics = {
  /**
   * Increment a counter metric
   */
  increment: (name: string, labels?: Record<string, string>) => {
    emitMetric(name, 1, labels);
  },

  /**
   * Record a histogram value (e.g., duration, size)
   */
  histogram: (name: string, value: number, labels?: Record<string, string>) => {
    emitMetric(name, value, labels);
  },

  /**
   * Record a gauge value (e.g., current count, queue size)
   */
  gauge: (name: string, value: number, labels?: Record<string, string>) => {
    emitMetric(name, value, labels);
  },

  // Pre-defined metric helpers
  meeting: {
    started: (meetingType: string) => {
      emitMetric('meeting.started', 1, { meeting_type: meetingType });
    },
    completed: (meetingType: string, durationSeconds: number) => {
      emitMetric('meeting.completed', 1, { meeting_type: meetingType });
      emitMetric('meeting.duration_seconds', durationSeconds, { meeting_type: meetingType });
    },
  },

  prospect: {
    intake: (source: string) => {
      emitMetric('prospect.intake', 1, { source });
    },
    qualified: () => {
      emitMetric('prospect.qualified', 1);
    },
    disqualified: () => {
      emitMetric('prospect.disqualified', 1);
    },
  },

  api: {
    request: (endpoint: string) => {
      emitMetric('api.request_count', 1, { endpoint });
    },
    response: (endpoint: string, durationMs: number, status: 'success' | 'failure') => {
      emitMetric('api.response_time_ms', durationMs, { endpoint, status });
      if (status === 'failure') {
        emitMetric('api.error_count', 1, { endpoint });
      }
    },
  },
};

export default metrics;
