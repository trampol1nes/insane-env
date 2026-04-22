# 02 — Validate with Zod

Uses Zod's `.parse` inside the validation hook. The returned type is inferred
from the schema, so `env.PORT` is a real `number` and `env.DEBUG` a real `boolean`.

Crucially, `process.env.PORT` stays the original `"3000"` string — EnvSupreme
never writes coerced values back (fixes `@nestjs/config` issue #1908).
