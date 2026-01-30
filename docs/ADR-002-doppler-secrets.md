# ADR-002: Doppler Secrets Management

## Status

**APPROVED**

## Context

The sales-navigator hub requires access to sensitive credentials:
- API keys for external integrations (Composio, Supabase, etc.)
- Database connection strings
- Third-party service tokens

Previously, secrets may have been stored in `.env` files, hardcoded in source, or managed inconsistently. This creates security risks and complicates environment management.

## Decision

**Doppler is REQUIRED as the sole secrets management provider for this repository.**

### Doppler Configuration

| Setting | Value |
|---------|-------|
| **Project Name** | `sales-navigator` |
| **Environments** | `dev`, `staging`, `prod` |
| **Access Method** | Doppler CLI / SDK |

### Required Secrets (By Environment)

| Secret Key | Purpose | Required In |
|------------|---------|-------------|
| `COMPOSIO_API_KEY` | MCP integration | All |
| `SUPABASE_URL` | Database connection | All |
| `SUPABASE_ANON_KEY` | Database auth | All |
| `ANTHROPIC_API_KEY` | AI integration | All |
| `OPENAI_API_KEY` | AI integration | All |

### Forbidden Practices

The following are STRICTLY FORBIDDEN:

1. **`.env` files with real secrets** — NEVER commit to repository
2. **Hardcoded credentials** — NEVER in source code
3. **Environment variables not sourced from Doppler** — NEVER in production
4. **Local credential files** — NEVER checked in

### Allowed Practices

1. `.env.example` with placeholder values (for documentation only)
2. Doppler CLI for local development: `doppler run -- npm start`
3. Doppler SDK for runtime secret access
4. CI/CD integration via Doppler service tokens

## Implementation

### Local Development

```bash
# Install Doppler CLI
brew install dopplerhq/cli/doppler

# Login and setup
doppler login
doppler setup --project sales-navigator --config dev

# Run application with secrets injected
doppler run -- npm run dev
```

### Production Deployment

1. Create service token in Doppler for production config
2. Configure CI/CD to use `DOPPLER_TOKEN`
3. Application accesses secrets via environment variables (injected by Doppler)

### Code Access Pattern

```typescript
// CORRECT: Doppler-injected environment variable
const apiKey = process.env.COMPOSIO_API_KEY;

// WRONG: Hardcoded value
const apiKey = "ak_t-F0AbvfZHUZSUrqAGNn"; // FORBIDDEN
```

## Enforcement

### Pre-Commit Hook

A pre-commit hook SHOULD scan for:
- Hardcoded API keys
- `.env` files with sensitive data
- Known credential patterns

### CI Validation

CI pipeline MUST:
- Reject commits containing hardcoded secrets
- Verify Doppler configuration exists
- Block deployment if secrets validation fails

## Consequences

### Positive

- Centralized secret management
- Environment-specific configurations
- Audit trail for secret access
- Easy secret rotation

### Negative

- Requires Doppler account and setup
- Additional dependency for local development
- Network dependency for secret access

### Mitigation

- Document Doppler setup in README.md
- Provide fallback for offline development (local Doppler cache)
- Monitor Doppler service status

## Compliance

| Check | Status |
|-------|--------|
| Doctrine compliant | YES |
| PRD referenced | YES (docs/PRD.md §9) |
| Infrastructure mandate | YES (DOCTRINE.md) |
| Human approval | PENDING |

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Author | Claude Opus 4.5 (AI) |
| Status | APPROVED |
| CC Layer | CC-03 |
