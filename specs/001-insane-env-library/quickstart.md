# Quickstart: InsaneEnv

**Date**: 2026-06-21 | **Plan**: [plan.md](./plan.md)

This guide validates that InsaneEnv works end-to-end. It assumes the monorepo is built and the `@insane-env/core` package is available. For full API details see [contracts/core-api.md](./contracts/core-api.md) and [data-model.md](./data-model.md).

---

## Prerequisites

- Node.js 18+
- The monorepo built locally (`pnpm install && pnpm build` at repo root)
- A test project (or the `packages/core/tests/fixtures` directory) with config files

---

## Scenario 1: Type-safe access from a single .env source (US1)

**Goal**: Prove that values come back typed and immutable.

**Setup** — create `.env`:
```
SERVER_PORT=3000
API_PREFIX=/api
IS_DEBUG=true
```

**Run** — define a schema class, a loader, and call `loadConfig`:
```typescript
import { loadConfig, InsaneEnv } from '@insane-env/core';

class AppConfig {
  SERVER_PORT: number;
  API_PREFIX: string;
  IS_DEBUG: boolean;
}

const loadFromEnv = () => ({
  SERVER_PORT: +process.env.SERVER_PORT,
  API_PREFIX: process.env.API_PREFIX,
  IS_DEBUG: process.env.IS_DEBUG === 'true',
});

loadConfig([{ type: '.env', file: '.env', loader: loadFromEnv }], { schema: AppConfig });
```

**Expected outcomes**:
- `InsaneEnv.get('SERVER_PORT')` returns `3000` (number, not `"3000"`)
- `InsaneEnv.get('IS_DEBUG')` returns `true` (boolean)
- `Object.isFrozen(InsaneEnv.getAll())` is `true`
- Attempting `InsaneEnv.getAll().SERVER_PORT = 4000` throws in strict mode

---

## Scenario 2: Multi-source precedence (US2)

**Goal**: Prove later sources override earlier ones across formats.

**Setup** — create `config.yaml`:
```yaml
SERVER_PORT: "8080"
API_PREFIX: /v2
IS_DEBUG: false
```

**Run**:
```typescript
loadConfig(
  [
    { type: '.env', file: '.env', loader: loadFromEnv },          // lowest precedence
    { type: '.yaml', file: 'config.yaml', loader: loadFromYaml }, // overrides .env
  ],
  { schema: AppConfig }
);
```

**Expected outcomes**:
- `InsaneEnv.get('SERVER_PORT')` returns `8080` (YAML source wins, coerced to number by its loader)
- `InsaneEnv.get('API_PREFIX')` returns `/v2`
- The value still passes the schema structure check (scalar where scalar expected)

---

## Scenario 3: Defaults fill missing keys (US2)

**Goal**: Prove the defaults option fills keys absent from all sources.

**Setup** — a `.env` missing `API_PREFIX`:
```
SERVER_PORT=3000
IS_DEBUG=false
```

**Run**:
```typescript
loadConfig(
  [{ type: '.env', file: '.env', loader: loadFromEnv }],
  { schema: AppConfig, defaults: { API_PREFIX: '/api' } }
);
```

**Expected outcomes**:
- `InsaneEnv.get('API_PREFIX')` returns `/api` (from defaults)
- `InsaneEnv.get('SERVER_PORT')` returns `3000` (from source, defaults not consulted)

---

## Scenario 4: Structure validation error (US1)

**Goal**: Prove a missing key or shape mismatch fails loudly at load time.

**Run** — loader omits a schema key:
```typescript
const badLoader = () => ({ SERVER_PORT: 3000 }); // missing API_PREFIX, IS_DEBUG

loadConfig([{ type: '.env', file: '.env', loader: badLoader }], { schema: AppConfig });
```

**Expected outcomes**:
- Throws `StructureError`
- Error message names the missing key (`API_PREFIX`), the expected type, and a suggestion
- Application startup halts (error not swallowed)

---

## Scenario 5: Optional validation callback (US1)

**Goal**: Prove a user-supplied, library-agnostic validator runs after merge.

**Run** — validator rejects an out-of-range port:
```typescript
const validator = (config: AppConfig) => {
  if (config.SERVER_PORT < 1 || config.SERVER_PORT > 65535) {
    throw new Error('SERVER_PORT out of range');
  }
  return config;
};

loadConfig(
  [{ type: '.env', file: '.env', loader: () => ({ SERVER_PORT: 99999, API_PREFIX: '/api', IS_DEBUG: false }) }],
  { schema: AppConfig, validator }
);
```

**Expected outcomes**:
- Throws `ValidationError` wrapping the callback's error
- No frozen config is exposed (validation runs before freeze)

---

## Scenario 6: NestJS DI + global coexistence (US3)

**Goal**: Prove DI access and global access return identical values.

**Setup** — register the module:
```typescript
@Module({
  imports: [
    InsaneEnvModule.forRoot({
      sources: [{ type: '.env', file: '.env', loader: loadFromEnv }],
      schema: AppConfig,
    }),
  ],
})
export class AppModule {}
```

**Run** — inject the service and also read the global:
```typescript
@Injectable()
export class AppService {
  constructor(private readonly config: InsaneEnvService<AppConfig>) {}
  check() {
    return this.config.get('SERVER_PORT') === InsaneEnv.get('SERVER_PORT');
  }
}
```

**Expected outcomes**:
- `AppService.check()` returns `true`
- Both access paths are typed (`number` for `SERVER_PORT`)

---

## Scenario 7: Multiple isolated instances (US5)

**Goal**: Prove named instances stay isolated.

**Run**:
```typescript
loadConfig([...appSources], { schema: AppConfig, name: 'app' });
loadConfig([...workerSources], { schema: WorkerConfig, name: 'worker' });
```

**Expected outcomes**:
- The `app` and `worker` instances expose independent key sets
- Reading a `worker`-only key from the `app` instance is a type error (compile time) and absent (runtime)

---

## Validation Checklist

- [ ] Scenario 1 passes — typed, immutable single-source access
- [ ] Scenario 2 passes — multi-source precedence
- [ ] Scenario 3 passes — defaults fill missing keys
- [ ] Scenario 4 passes — structure error on missing key
- [ ] Scenario 5 passes — validation callback runs
- [ ] Scenario 6 passes — NestJS DI + global coexistence
- [ ] Scenario 7 passes — isolated named instances

AWS Secrets Manager scenarios are deferred (post-MVP) and intentionally excluded from this guide.
