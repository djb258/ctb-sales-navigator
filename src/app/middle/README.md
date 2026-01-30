# Middle Layer (M)

**IMO Layer**: M (Middle)
**Purpose**: All logic, decisions, transformations, state ownership

## Rules

- ALL business logic lives here
- ALL decisions are made here
- ALL state mutations happen here
- ALL tool invocations occur here

## Contents

This folder contains the core sales process logic:
- Meeting workflow orchestration
- Prospect qualification logic
- Sales state management
- Integration coordination

## Allowed Operations

- Business logic execution
- State management
- Decision making
- Tool invocations
- Database operations
- External service calls (via Composio MCP)

## Structure

```
middle/
├── workflows/      # Process orchestration
├── services/       # Business services
├── state/          # State management
└── handlers/       # Event handlers
```
