# 03 — Manual validation (no library)

Pure TypeScript validation — no Zod, no Valibot, no class-validator.
Demonstrates:

- Custom shape (nested/aliased keys: `PORT` → `port`)
- Error wrapping: hook failures surface as `EnvSupremeValidationError`
  with the original thrown error on `.cause`.
