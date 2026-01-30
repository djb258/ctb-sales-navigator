# Observability — Sales Navigator

**Status**: ACTIVE
**Authority**: CONSTITUTION.md
**CC Layer**: CC-04

---

## Purpose

This document defines the observability strategy for the Sales Navigator hub, covering logging, metrics, and alerting.

---

## Observability Stack

| Component | Tool | Purpose |
|-----------|------|---------|
| Logging | Vercel Logs + Custom Logger | Application and audit logs |
| Metrics | Vercel Analytics | Performance and usage metrics |
| Alerting | Vercel + Doppler | Error and threshold alerts |
| Tracing | Process ID (PID) | Request tracing |

---

## Logging

### Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| ERROR | Failures requiring attention | Database connection failed |
| WARN | Potential issues | Rate limit approaching |
| INFO | Normal operations | Meeting completed |
| DEBUG | Development details | Query execution time |

### Log Format

```typescript
interface LogEntry {
  timestamp: string;      // ISO 8601
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
  pid: string;            // Process ID for tracing
  hub_id: string;         // HUB-SALES-NAV-20260130
  context: string;        // Component name
  message: string;        // Human-readable message
  data?: Record<string, unknown>;  // Structured data
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}
```

### Log Categories

| Category | Retention | Purpose |
|----------|-----------|---------|
| audit | 90 days | Security and compliance |
| application | 30 days | General application logs |
| performance | 7 days | Performance metrics |
| debug | 1 day | Development debugging |

### Implementation

```typescript
// src/sys/observability/logger.ts
import { getRequiredEnv } from '../doppler';

export const logger = {
  error: (context: string, message: string, data?: object) => {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      pid: process.env.PID || 'unknown',
      hub_id: 'HUB-SALES-NAV-20260130',
      context,
      message,
      data
    }));
  },

  warn: (context: string, message: string, data?: object) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      pid: process.env.PID || 'unknown',
      hub_id: 'HUB-SALES-NAV-20260130',
      context,
      message,
      data
    }));
  },

  info: (context: string, message: string, data?: object) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      pid: process.env.PID || 'unknown',
      hub_id: 'HUB-SALES-NAV-20260130',
      context,
      message,
      data
    }));
  },

  debug: (context: string, message: string, data?: object) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        pid: process.env.PID || 'unknown',
        hub_id: 'HUB-SALES-NAV-20260130',
        context,
        message,
        data
      }));
    }
  },

  audit: (action: string, actor: string, resource: string, data?: object) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      pid: process.env.PID || 'unknown',
      hub_id: 'HUB-SALES-NAV-20260130',
      context: 'AUDIT',
      message: `${action} by ${actor} on ${resource}`,
      data: { action, actor, resource, ...data }
    }));
  }
};
```

---

## Metrics

### Key Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `meeting.started` | Counter | Meetings started |
| `meeting.completed` | Counter | Meetings completed |
| `meeting.duration_seconds` | Histogram | Meeting duration |
| `prospect.intake` | Counter | Prospects ingested |
| `prospect.qualified` | Counter | Prospects qualified |
| `prospect.disqualified` | Counter | Prospects disqualified |
| `api.request_count` | Counter | API requests |
| `api.response_time_ms` | Histogram | API response time |
| `api.error_count` | Counter | API errors |

### Metric Labels

| Label | Values | Purpose |
|-------|--------|---------|
| meeting_type | fact_finder, insurance_ed, systems_ed, financials | Meeting classification |
| status | success, failure, timeout | Operation status |
| source | crm, manual | Data source |

### Implementation

```typescript
// src/sys/observability/metrics.ts
export const metrics = {
  increment: (name: string, labels?: Record<string, string>) => {
    // Log metric for Vercel Analytics ingestion
    console.log(JSON.stringify({
      type: 'metric',
      name,
      value: 1,
      labels,
      timestamp: new Date().toISOString()
    }));
  },

  histogram: (name: string, value: number, labels?: Record<string, string>) => {
    console.log(JSON.stringify({
      type: 'metric',
      name,
      value,
      labels,
      timestamp: new Date().toISOString()
    }));
  },

  gauge: (name: string, value: number, labels?: Record<string, string>) => {
    console.log(JSON.stringify({
      type: 'metric',
      name,
      value,
      labels,
      timestamp: new Date().toISOString()
    }));
  }
};
```

---

## Alerting

### Alert Definitions

| Alert | Condition | Severity | Action |
|-------|-----------|----------|--------|
| High Error Rate | errors > 10/min | HIGH | Page on-call |
| Database Unavailable | connection failed | CRITICAL | Page + kill switch |
| Doppler Unavailable | secrets fetch failed | CRITICAL | Page + kill switch |
| Slow Response | p95 > 5s | MEDIUM | Notify Slack |
| Meeting Stuck | in_progress > 2h | LOW | Notify Slack |

### Alert Channels

| Channel | Use Case | Configuration |
|---------|----------|---------------|
| Vercel | Deployment failures | Built-in |
| Email | Critical alerts | Doppler: `ALERT_EMAIL` |
| Slack | All alerts | Doppler: `SLACK_WEBHOOK_URL` |
| PagerDuty | Critical after-hours | Doppler: `PAGERDUTY_KEY` |

### Alert Configuration

```typescript
// src/sys/observability/alerts.ts
interface AlertConfig {
  name: string;
  condition: () => boolean;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  channels: ('email' | 'slack' | 'pagerduty')[];
  cooldown_minutes: number;
}

export const alertConfigs: AlertConfig[] = [
  {
    name: 'high_error_rate',
    condition: () => errorCountLastMinute() > 10,
    severity: 'HIGH',
    channels: ['slack', 'pagerduty'],
    cooldown_minutes: 5
  },
  {
    name: 'database_unavailable',
    condition: () => !databaseHealthy(),
    severity: 'CRITICAL',
    channels: ['slack', 'pagerduty', 'email'],
    cooldown_minutes: 1
  }
];
```

---

## Tracing

### Process ID (PID) Format

```
SALES-NAV-{TIMESTAMP}-{RANDOM_HEX}

Example: SALES-NAV-20260130T120000-a1b2c3d4
```

### Trace Propagation

```typescript
// src/sys/observability/tracing.ts
export function generatePID(): string {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const random = Math.random().toString(16).substring(2, 10);
  return `SALES-NAV-${timestamp}-${random}`;
}

export function withPID<T>(fn: (pid: string) => T): T {
  const pid = generatePID();
  process.env.PID = pid;
  try {
    return fn(pid);
  } finally {
    delete process.env.PID;
  }
}
```

---

## Dashboards

### Vercel Dashboard

| View | URL | Purpose |
|------|-----|---------|
| Deployments | vercel.com/dashboard | Deployment status |
| Analytics | vercel.com/analytics | Web vitals, traffic |
| Logs | vercel.com/logs | Application logs |

### Supabase Dashboard

| View | Purpose |
|------|---------|
| Database | Query performance, connections |
| Auth | Authentication metrics |
| Storage | File storage usage |

---

## Health Checks

### Endpoint

```
GET /api/health
```

### Response

```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy' | 'shutdown';
  timestamp: string;
  hub_id: string;
  checks: {
    database: 'ok' | 'error';
    doppler: 'ok' | 'error';
    kill_switch: 'inactive' | 'active';
  };
  version: string;
}
```

### Implementation

```typescript
// src/app/server/health.ts
export async function healthCheck(): Promise<HealthResponse> {
  const dbOk = await checkDatabase();
  const dopplerOk = checkDopplerSecrets();
  const killSwitchActive = process.env.KILL_SWITCH_ACTIVE === 'true';

  let status: HealthResponse['status'] = 'healthy';
  if (killSwitchActive) status = 'shutdown';
  else if (!dbOk || !dopplerOk) status = 'unhealthy';

  return {
    status,
    timestamp: new Date().toISOString(),
    hub_id: 'HUB-SALES-NAV-20260130',
    checks: {
      database: dbOk ? 'ok' : 'error',
      doppler: dopplerOk ? 'ok' : 'error',
      kill_switch: killSwitchActive ? 'active' : 'inactive'
    },
    version: process.env.npm_package_version || '1.0.0'
  };
}
```

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Authority | CC-04 |
