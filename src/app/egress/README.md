# Egress Layer (O)

**IMO Layer**: O (Egress)
**Purpose**: Outputs and exports

## Rules

- Read-only views
- Downstream signals
- MUST NOT contain logic
- MUST NOT make decisions

## Contents

This folder contains egress handlers for the sales process:
- Report generators
- Analytics exporters
- Notification dispatchers
- CRM update formatters

## Allowed Operations

- Data formatting
- Report generation
- Notification dispatch
- Read-only queries

## Forbidden Operations

- Business logic
- Decision making
- State mutation
- Direct writes to source systems
