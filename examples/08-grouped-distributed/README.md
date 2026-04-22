# 08 — Grouped schema: distributed independent objects (Mode 2)

Each domain exports its own `createEnv(...)` call. No cross-contamination:
`dbEnv` sees only `DB_*` vars, `authEnv` sees only `AUTH_*`. Ideal for
microservices or modular monoliths where different NestJS modules import
only their own config.

Both objects are independently crystallized and deeply frozen.
