# 04 — Multi-file merge with precedence

Precedence (low → high):

1. Files in `options.files` order — later files override earlier ones
2. `options.sources` — defaults to `[process.env]`, wins over files

This matches the 12-factor rule: OS-injected variables always beat committed
defaults. Fixes `@nestjs/config` issue #2018 (race between `.env.local` and
`registerAs`).
