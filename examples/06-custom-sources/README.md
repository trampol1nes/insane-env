# 06 — Custom sources (no `process.env`)

Pass your own in-memory maps via `sources`. Useful for:

- Tests: deterministic env without touching `process.env`
- Simulating Vault / AWS Secrets fetches before the real plugin lands
- Layered defaults — later arrays override earlier ones
