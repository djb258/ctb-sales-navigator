# Ingress Layer (I)

**IMO Layer**: I (Ingress)
**Purpose**: Data entry point

## Rules

- MAY validate schema
- MUST NOT make decisions
- MUST NOT mutate business state
- MUST NOT contain business logic

## Contents

This folder contains ingress handlers for the sales process:
- CRM data intake
- External API receivers
- Webhook handlers

## Allowed Operations

- Schema validation
- Data normalization
- Format conversion
- Logging

## Forbidden Operations

- Business logic
- State mutation
- Decision making
- Direct database writes
