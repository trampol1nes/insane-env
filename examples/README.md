# EnvSupreme Examples

Each subfolder is a self-contained, runnable demo of one use case.
New examples are added here as features land.

| Folder | Feature | Section |
| --- | --- | --- |
| [`01-basic-no-validation`](./01-basic-no-validation) | Load `.env`, get a frozen raw map | §4.2 |
| [`02-validate-with-zod`](./02-validate-with-zod) | Optional validation hook using Zod | §4.2 |
| [`03-validate-manual`](./03-validate-manual) | Optional validation hook without any library | §4.2 |
| [`04-multi-file-merge`](./04-multi-file-merge) | Merge `.env` + `.env.local` (later wins, OS overrides files) | §4.2 |
| [`05-json-source`](./05-json-source) | Load configuration from a `.json` file | §4.2 |
| [`06-custom-sources`](./06-custom-sources) | Inject in-memory sources (skip `process.env`) | §4.2 |
| [`07-grouped-unified`](./07-grouped-unified) | `createGroupedEnv` — nested groups, lazy eval, `derive()` | §4.4 |
| [`08-grouped-distributed`](./08-grouped-distributed) | Independent `createEnv` per domain, prefix isolation | §4.4 |

## Running

From the repo root:

```bash
pnpm install
pnpm --filter @env-supreme/core build
pnpm --filter example-01-basic-no-validation start
```

Replace `01-basic-no-validation` with any folder name above.
