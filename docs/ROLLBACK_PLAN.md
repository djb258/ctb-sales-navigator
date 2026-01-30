# Rollback Plan — Sales Navigator

**Status**: ACTIVE
**Authority**: CONSTITUTION.md
**CC Layer**: CC-02

---

## Purpose

This document defines the rollback procedures for the Sales Navigator hub to restore previous stable states when issues are detected.

---

## Rollback Triggers

| Trigger | Severity | Rollback Scope |
|---------|----------|----------------|
| Production bug affecting users | HIGH | Application |
| Data corruption | CRITICAL | Database |
| Security vulnerability | CRITICAL | Full stack |
| Failed deployment | MEDIUM | Application |
| Breaking API change | HIGH | Application |
| Doppler misconfiguration | HIGH | Configuration |

---

## Rollback Types

### 1. Application Rollback (Vercel)

**Scope**: Frontend + API routes
**RTO**: < 5 minutes

```bash
# List recent deployments
vercel ls sales-navigator --prod

# Rollback to previous deployment
vercel rollback [DEPLOYMENT_URL] --prod

# Verify rollback
curl https://sales-navigator.vercel.app/api/health
```

**Automated via Vercel Dashboard**:
1. Navigate to Deployments
2. Find last known good deployment
3. Click "..." → "Promote to Production"

### 2. Database Rollback (Supabase)

**Scope**: Data and schema
**RTO**: 15-30 minutes (depending on data size)

#### Point-in-Time Recovery (PITR)

```sql
-- Supabase Dashboard → Database → Backups → Point in Time Recovery
-- Select timestamp before incident
-- Confirm restoration
```

#### Migration Rollback

```bash
# Rollback last migration
supabase db reset --linked

# Or apply specific down migration
supabase migration repair --status reverted [MIGRATION_ID]
```

### 3. Configuration Rollback (Doppler)

**Scope**: Environment variables and secrets
**RTO**: < 2 minutes

```bash
# List config versions
doppler configs logs --project sales-navigator --config prod

# Rollback to previous version
doppler configs rollback --project sales-navigator --config prod --version [VERSION]

# Verify secrets
doppler secrets --project sales-navigator --config prod
```

### 4. Full Stack Rollback

**Scope**: Application + Database + Configuration
**RTO**: 30-60 minutes

**Procedure**:
1. Activate kill switch (see KILL_SWITCH.md)
2. Rollback Doppler configuration
3. Rollback database to PITR
4. Rollback Vercel deployment
5. Deactivate kill switch
6. Verify all systems

---

## Rollback Decision Matrix

| Issue Type | First Action | Rollback Type | Authority |
|------------|--------------|---------------|-----------|
| UI bug | Hotfix | Application | CC-04 |
| API error | Investigate | Application | CC-04 |
| Data loss | Kill switch | Database | CC-02 |
| Security breach | Kill switch | Full stack | CC-01 |
| Secret exposure | Rotate + kill | Configuration | CC-02 |

---

## Pre-Rollback Checklist

- [ ] Issue confirmed and documented
- [ ] Rollback authorized by appropriate CC level
- [ ] Current state backed up (if possible)
- [ ] Stakeholders notified
- [ ] Rollback target identified (version/timestamp)
- [ ] Post-rollback verification plan ready

---

## Post-Rollback Verification

### Application Verification

```bash
# Health check
curl https://sales-navigator.vercel.app/api/health

# Smoke test - list prospects
curl https://sales-navigator.vercel.app/api/prospects \
  -H "Authorization: Bearer ${API_TOKEN}"

# Verify version
curl https://sales-navigator.vercel.app/api/version
```

### Database Verification

```sql
-- Check table integrity
SELECT COUNT(*) FROM prospect;
SELECT COUNT(*) FROM sales_process;
SELECT COUNT(*) FROM meeting;
SELECT COUNT(*) FROM meeting_outcome;

-- Check recent records
SELECT * FROM prospect ORDER BY created_at DESC LIMIT 5;
```

### Configuration Verification

```bash
# Verify all required secrets present
doppler secrets --project sales-navigator --config prod | grep -E "SUPABASE|COMPOSIO|ANTHROPIC"
```

---

## Rollback Testing Schedule

| Test Type | Frequency | Environment | Owner |
|-----------|-----------|-------------|-------|
| Application rollback | Monthly | Staging | DevOps |
| Database PITR | Quarterly | Staging | DBA |
| Full stack drill | Quarterly | Staging | Hub Owner |
| Configuration rollback | Monthly | Staging | DevOps |

---

## Known Rollback Limitations

| Limitation | Mitigation |
|------------|------------|
| PITR window is 7 days | Daily backups to external storage |
| Vercel keeps 10 deployments | Tag critical releases in git |
| Doppler keeps 30 versions | Document major config changes |
| User data created post-incident | Manual data reconciliation |

---

## Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| DevOps | On-call | Execute rollback |
| Hub Owner | SVG Agency | Authorize rollback |
| DBA | On-call | Database rollback |
| Sovereign | Leadership | CC-01 authorization |

---

## Rollback Log Template

```markdown
## Rollback Event

**Date**: YYYY-MM-DD HH:MM
**Operator**: [Name]
**Authority**: CC-[01|02|04]

### Trigger
[Description of issue that triggered rollback]

### Actions Taken
1. [Action 1]
2. [Action 2]
3. [Action 3]

### Rollback Target
- Application: [Deployment ID]
- Database: [Timestamp]
- Configuration: [Version]

### Verification
- [ ] Health check passed
- [ ] Smoke tests passed
- [ ] Data integrity verified

### Post-Incident
- Root cause: [Description]
- Prevention: [Action items]
```

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Version | 1.0.0 |
| Status | ACTIVE |
| Authority | CC-02 |
