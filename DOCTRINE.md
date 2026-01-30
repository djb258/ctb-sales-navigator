# Doctrine Reference

This repository is governed by **IMO-Creator**.

---

## Conformance Declaration

| Field | Value |
|-------|-------|
| **Parent** | imo-creator |
| **Sovereignty** | INHERITED |
| **Doctrine Version** | 1.5.0 |
| **CTB Version** | 1.1.0 |

---

## Hub Declaration

| Field | Value |
|-------|-------|
| **Hub Name** | sales-navigator |
| **Hub Type** | SALES |
| **Domain** | Sales Process Management |
| **Purpose** | 4-meeting sales process orchestration |

---

## Infrastructure Requirements

| Requirement | Provider | Status |
|-------------|----------|--------|
| **Secrets Management** | Doppler | REQUIRED |
| **Environment Config** | Doppler | REQUIRED |
| **Presentation Layer** | Lovable.dev | DECLARED |

### Doppler Mandate

This repository REQUIRES Doppler for all secrets and environment configuration.

**Forbidden:**
- `.env` files with secrets (NEVER commit)
- Hardcoded API keys
- Environment variables not sourced from Doppler

**Required:**
- Doppler project: `sales-navigator`
- Doppler configs: `dev`, `staging`, `prod`

---

## Binding Documents

This repository conforms to the following doctrine files from IMO-Creator:

| Document | Purpose | Location |
|----------|---------|----------|
| CANONICAL_ARCHITECTURE_DOCTRINE.md | Operating physics | imo-creator/templates/doctrine/ |
| ALTITUDE_DESCENT_MODEL.md | CC descent sequence | imo-creator/templates/doctrine/ |
| TEMPLATE_IMMUTABILITY.md | AI modification prohibition | imo-creator/templates/doctrine/ |
| REPO_REFACTOR_PROTOCOL.md | Structure rules | imo-creator/templates/doctrine/ |
| SNAP_ON_TOOLBOX.yaml | Tool registry | imo-creator/templates/ |
| IMO_SYSTEM_SPEC.md | System index | imo-creator/templates/ |
| AI_EMPLOYEE_OPERATING_CONTRACT.md | Agent constraints | imo-creator/templates/ |

---

## Domain-Specific Bindings

This repository's domain-specific bindings are declared in:

```
doctrine/REPO_DOMAIN_SPEC.md
```

This file maps generic roles to Sales-specific tables and concepts.

---

## Authority Rule

> Parent doctrine is READ-ONLY.
> Domain specifics live in REPO_DOMAIN_SPEC.md.
> If rules conflict, parent wins.
> Doppler is the ONLY allowed secrets provider.

---

## Document Control

| Field | Value |
|-------|-------|
| Created | 2026-01-30 |
| Last Modified | 2026-01-30 |
| Status | ACTIVE |
