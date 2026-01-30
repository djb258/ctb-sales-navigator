# Kill Switch — Sales Navigator

**Status**: ACTIVE
**Authority**: CONSTITUTION.md
**CC Layer**: CC-02

---

## Purpose

The kill switch provides immediate shutdown capability for the Sales Navigator hub when critical conditions are detected.

---

## Activation Criteria

| Trigger | Severity | Authority Required |
|---------|----------|-------------------|
| Data breach detected | CRITICAL | CC-01 (Sovereign) |
| System abuse detected | CRITICAL | CC-02 (Hub) |
| Compliance violation | CRITICAL | CC-01 (Sovereign) |
| Doppler unavailable > 5 min | HIGH | CC-02 (Hub) |
| Database corruption | CRITICAL | CC-02 (Hub) |
| Unauthorized access attempt | HIGH | CC-02 (Hub) |

---

## Kill Switch Endpoints

### 1. Application Kill Switch

**Endpoint**: `POST /api/admin/kill-switch`

```typescript
// src/app/server/kill-switch.ts
interface KillSwitchRequest {
  reason: string;
  authority: 'CC-01' | 'CC-02';
  operator: string;
  timestamp: string;
}

interface KillSwitchResponse {
  status: 'activated' | 'failed';
  affected_processes: number;
  shutdown_time: string;
}
```

**Actions Performed**:
1. Set `KILL_SWITCH_ACTIVE=true` in Doppler
2. Terminate all active meeting sessions
3. Disable all ingress endpoints
4. Log shutdown event to audit trail
5. Send alert to emergency contacts

### 2. Database Kill Switch

**Endpoint**: Supabase Dashboard → Pause Project

**Actions Performed**:
1. Suspend all database connections
2. Preserve data in read-only state
3. Block all write operations

### 3. Doppler Kill Switch

**Action**: Revoke all service tokens

**Effect**: All environment variables become unavailable, causing graceful failure.

---

## Activation Procedure

### Step 1: Verify Authority

```
IF trigger requires CC-01 AND operator is not Sovereign:
  → REJECT activation
  → Escalate to Sovereign

IF trigger requires CC-02 AND operator is not Hub Owner:
  → REJECT activation
  → Escalate to Hub Owner
```

### Step 2: Execute Shutdown

```bash
# Via API
curl -X POST https://sales-navigator.vercel.app/api/admin/kill-switch \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Security incident detected",
    "authority": "CC-02",
    "operator": "Hub Owner",
    "timestamp": "2026-01-30T12:00:00Z"
  }'

# Via Doppler (emergency)
doppler secrets set KILL_SWITCH_ACTIVE=true --project sales-navigator --config prod
```

### Step 3: Verify Shutdown

```bash
# Check health endpoint (should return 503)
curl https://sales-navigator.vercel.app/api/health
# Expected: { "status": "shutdown", "reason": "kill_switch_active" }
```

### Step 4: Notify Stakeholders

| Contact | Method | SLA |
|---------|--------|-----|
| SVG Agency Operations | Email + SMS | Immediate |
| Hub Owner | Slack + Email | < 5 min |
| Sovereign | Email | < 15 min |

---

## Deactivation Procedure

### Prerequisites
- Root cause identified and resolved
- Authorization from same level that activated
- Post-incident review scheduled

### Steps

```bash
# 1. Disable kill switch
doppler secrets set KILL_SWITCH_ACTIVE=false --project sales-navigator --config prod

# 2. Restart application
vercel redeploy --prod

# 3. Verify restoration
curl https://sales-navigator.vercel.app/api/health
# Expected: { "status": "healthy" }

# 4. Resume database (if paused)
# Via Supabase Dashboard → Resume Project
```

---

## Testing Protocol

| Test | Frequency | Owner |
|------|-----------|-------|
| API endpoint test | Weekly | DevOps |
| Full activation drill | Quarterly | Hub Owner |
| Recovery drill | Quarterly | Hub Owner |

### Test Command

```bash
# Test in staging only
curl -X POST https://sales-navigator-staging.vercel.app/api/admin/kill-switch/test \
  -H "Authorization: Bearer ${STAGING_ADMIN_TOKEN}"
```

---

## Emergency Contacts

| Role | Contact | Method |
|------|---------|--------|
| Hub Owner | SVG Agency | Email: ops@svg.agency |
| Sovereign | SVG Agency Leadership | Email: leadership@svg.agency |
| DevOps | On-call | PagerDuty |

---

## Audit Trail

All kill switch activations are logged to:
- Supabase `audit_log` table
- Doppler activity log
- Vercel deployment log

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Authority | CC-02 |
