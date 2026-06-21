# InsaneEnv NestJS Adapter Public API Contract

**Package**: `@insane-env/nestjs`  
**Date**: 2026-06-21  
**Plan**: [../plan.md](../plan.md)

This document defines the public API contract for the NestJS adapter package.

---

## `InsaneEnvModule.forRoot<T>(config): DynamicModule`

**Purpose**: Register InsaneEnv as a global NestJS module with default instance.

**Type Signature**:
```typescript
class InsaneEnvModule {
  static forRoot<T extends object>(
    config: InsaneEnvModuleConfig<T>
  ): DynamicModule;
}
```

**Parameters**:
- `config`:
  - `sources`: Array of configuration sources
  - `schema`: Schema class reference
  - `defaults`: Optional fallback values
  - `validator`: Optional validation callback
  - `isGlobal`: Whether module is global (default: true)

**Returns**: NestJS `DynamicModule` with `InsaneEnvService` provider

**Contract Guarantees**:
- Module is global by default (no need to import in every module)
- Configuration loaded eagerly at module initialization
- Failures during load throw and prevent app startup

**Example**:
```typescript
@Module({
  imports: [
    InsaneEnvModule.forRoot({
      sources: [
        { type: '.env', file: '.env', loader: loadFromEnv }
      ],
      schema: AppConfig
    })
  ]
})
export class AppModule {}
```

---

## `InsaneEnvModule.forFeature<T>(name, config): DynamicModule`

**Purpose**: Register a named instance for feature-specific configuration.

**Type Signature**:
```typescript
class InsaneEnvModule {
  static forFeature<T extends object>(
    name: string,
    config: InsaneEnvModuleConfig<T>
  ): DynamicModule;
}
```

**Parameters**:
- `name`: Unique instance identifier (e.g., 'worker', 'admin')
- `config`: Same as `forRoot`

**Returns**: NestJS `DynamicModule` with named provider

**Contract Guarantees**:
- Named instances isolated from default instance
- Each feature module can have its own schema and sources
- Injection token: `INSANE_ENV_${name.toUpperCase()}`

**Example**:
```typescript
@Module({
  imports: [
    InsaneEnvModule.forFeature('worker', {
      sources: [{ type: '.env', file: '.env.worker', loader: loadWorkerConfig }],
      schema: WorkerConfig
    })
  ]
})
export class WorkerModule {}
```

---

## `InsaneEnvService<T>`

**Purpose**: Injectable service for accessing configuration via DI.

**Type Signature**:
```typescript
@Injectable()
class InsaneEnvService<T extends object> {
  get<K extends keyof T>(key: K): T[K];
  getAll(): Readonly<T>;
}
```

**Parameters**:
- `key`: Configuration key (typed, autocomplete from schema)

**Returns**: Typed value for the key

**Contract Guarantees**:
- Same type safety as `InsaneEnv.get()` from core
- Access is synchronous
- Values are immutable

**Example**:
```typescript
@Injectable()
export class AppService {
  constructor(private readonly config: InsaneEnvService<AppConfig>) {}

  getPort(): number {
    return this.config.get('SERVER_PORT');
  }
}
```

---

## Injection Tokens

**Purpose**: Tokens for injecting named instances.

**Exports**:
```typescript
export const INSANE_ENV_DEFAULT = 'INSANE_ENV_DEFAULT';
export const getInsaneEnvToken = (name: string) => `INSANE_ENV_${name.toUpperCase()}`;
```

**Usage**:
```typescript
@Injectable()
export class WorkerService {
  constructor(
    @Inject('INSANE_ENV_WORKER') private readonly config: InsaneEnvService<WorkerConfig>
  ) {}
}
```

**Contract Guarantees**:
- Default instance always available via `INSANE_ENV_DEFAULT` token
- Named instances via `INSANE_ENV_${name}` token
- Tokens are string constants (not symbols) for better debugging

---

## Global vs. DI Access Coexistence

**Behavior**: Both `InsaneEnv.get()` (global singleton from core) and `InsaneEnvService` (DI) access the same underlying configuration.

**Contract Guarantees**:
- Global and DI return identical values for the same key
- Modifications to either are impossible (both frozen)
- Named instances only accessible via DI (no global equivalent)

**Example**:
```typescript
// Both return the same value
const portGlobal = InsaneEnv.get('SERVER_PORT');
const portDI = this.config.get('SERVER_PORT');
```

---

## Deprecations & Breaking Changes

**v1.0.0**:
- Initial stable release
- No deprecations yet
