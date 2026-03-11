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

### 1. Application Rollback (CF Workers)

**Scope**: Frontend + API routes
**RTO**: < 5 minutes

```bash
# List recent deployments
wrangler deployments list

# Rollback to previous deployment
wrangler rollback [DEPLOYMENT_ID]

# Verify rollback
curl https://sales-navigator.workers.dev/api/health
```

**Automated via CF Dashboard**:
1. Navigate to Workers → sales-navigator
2. Find last known good deployment
3. Click "Rollback" on the target version

### 2. Database Rollback (CF D1 + Neon Vault)

**Scope**: Data and schema
**RTO**: 15-30 minutes (depending on data size)

#### CF D1 (Working Database)

```bash
# Export current D1 state
wrangler d1 export sales-navigator-db --output=backup.sql

# Restore from previous backup
wrangler d1 execute sales-navigator-db --file=restore.sql
```

#### Neon Vault (Archive) — Point-in-Time Recovery (PITR)

```sql
-- Neon Dashboard → Branches → Restore → Point in Time Recovery
-- Select timestamp before incident
-- Confirm restoration
```

#### Migration Rollback (Neon Vault)

```bash
# Apply specific down migration against Neon vault
doppler run -- psql $NEON_DATABASE_URL -f sales/migrations/rollback_[MIGRATION_ID].sql
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
3. Rollback CF D1 working database + Neon vault to PITR
4. Rollback CF Workers deployment
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
curl https://sales-navigator.workers.dev/api/health

# Smoke test - list prospects
curl https://sales-navigator.workers.dev/api/prospects \
  -H "Authorization: Bearer ${API_TOKEN}"

# Verify version
curl https://sales-navigator.workers.dev/api/version
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
doppler secrets --project sales-navigator --config prod | grep -E "CF_|NEON|COMPOSIO|ANTHROPIC"
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
| Neon PITR window is 7 days | Daily backups to external storage |
| CF Workers deployment history | Tag critical releases in git |
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
