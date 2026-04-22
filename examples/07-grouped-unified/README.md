# 07 — Grouped schema: unified object (Mode 1)

Single `createGroupedEnv({ groups })` call, per-group validation hook, lazy evaluation.

- `env.database`, `env.auth`, `env.redis` — each has its own schema and can use any validation library (Zod here).
- **Prefix filtering**: `prefix: 'DB_'` strips `DB_` from keys so the schema can use `HOST`/`PORT`/`NAME`.
- **Lazy**: only groups actually accessed get built. The `touched` counter proves unaccessed groups cost nothing.
- **`derive()`**: cross-group computation, evaluated on first `.value` access and frozen.
- Grouped env is itself immutable — assigning to a group throws.
