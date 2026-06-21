# InsaneEnv Core Public API Contract

**Package**: `@insane-env/core`  
**Date**: 2026-06-21  
**Plan**: [../plan.md](../plan.md)

This document defines the public API contract for the core package. Breaking changes to these signatures require a major version bump.

---

## `loadConfig<T>(sources, options): T`

**Purpose**: Load and merge configuration from multiple sources, validate structure, and return frozen typed config.

**Type Signature**:
```typescript
function loadConfig<T extends object>(
  sources: ConfigSource<T>[],
  options: LoadConfigOptions<T>
): Readonly<T>
```

**Parameters**:
- `sources`: Array of configuration sources in precedence order (later sources override earlier)
  - Each source has: `type`, `file` (optional), `parser` (optional), `loader` (required)
- `options`:
  - `schema`: Schema class reference (required)
  - `defaults`: Fallback values object (optional)
  - `validator`: Validation callback (optional)
  - `name`: Instance name for multi-instance scenarios (optional, default: 'default')

**Returns**: Frozen configuration object matching schema type `T`

**Throws**:
- `StructureError`: Loader output missing key from schema, or type mismatch (object vs scalar)
- `ValidationError`: Validator callback rejected the config
- `ParserError`: File parsing failed

**Contract Guarantees**:
- Result is deeply frozen (Object.isFrozen returns true for all nested objects)
- All keys declared in schema are present in result
- Types match schema declaration (enforced at runtime)
- Sources merged left-to-right (index 0 = lowest precedence)
- Defaults applied before sources (lowest precedence)

**Example**:
```typescript
class AppConfig {
  SERVER_PORT: number;
  API_PREFIX: string;
}

const config = loadConfig<AppConfig>(
  [
    { type: '.env', file: '.env', loader: loadFromEnv },
    { type: '.yaml', file: 'config.yaml', loader: loadFromYaml }
  ],
  {
    schema: AppConfig,
    defaults: { SERVER_PORT: 3000, API_PREFIX: '/api' }
  }
);

// config.SERVER_PORT is number, typed and runtime-guaranteed
```

---

## `InsaneEnv.get<K extends keyof T>(key: K): T[K]`

**Purpose**: Access configuration value from default instance via global singleton.

**Type Signature**:
```typescript
class InsaneEnv {
  static get<T extends object, K extends keyof T>(key: K): T[K];
  static getAll<T extends object>(): Readonly<T>;
}
```

**Parameters**:
- `key`: Configuration key (typed, autocomplete from schema)

**Returns**: Typed value for the key

**Throws**:
- `ConfigNotLoadedError`: `loadConfig()` not called yet
- `KeyNotFoundError`: Key does not exist in config (should never happen if schema validated)

**Contract Guarantees**:
- Return type matches schema declaration for that key
- Value is immutable (modification throws in strict mode)
- Access is synchronous (no async overhead)

**Example**:
```typescript
const port = InsaneEnv.get('SERVER_PORT'); // type: number
const prefix = InsaneEnv.get('API_PREFIX'); // type: string
```

---

## `ConfigSource<T>`

**Purpose**: Descriptor for a configuration source.

**Type Definition**:
```typescript
interface ConfigSource<T extends object> {
  type: '.env' | '.json' | '.yaml' | string;
  file?: string;
  parser?: (filePath: string) => Record<string, unknown>;
  loader: (rawValues: Record<string, unknown>) => T;
}
```

**Fields**:
- `type`: Format hint (built-in: `.env`, `.json`, `.yaml`; custom: any string)
- `file`: Path to config file (optional if source is process.env or in-memory)
- `parser`: Custom parser function (optional, defaults to built-in for known types)
- `loader`: Required function transforming raw parsed values into schema-typed object

**Contract Guarantees**:
- `loader` must return all keys from schema
- `loader` return type must match schema structure (scalar vs object)
- `parser` must return plain object (no circular refs, no class instances)

---

## Built-in Parsers

**Purpose**: Provided parsers for common formats.

**Exports**:
```typescript
export const envParser: (filePath: string) => Record<string, string>;
export const jsonParser: (filePath: string) => Record<string, unknown>;
export const yamlParser: (filePath: string) => Record<string, unknown>;
```

**Contract Guarantees**:
- `envParser`: Returns all variables as strings (mimics process.env)
- `jsonParser`: Preserves native types (numbers, booleans, arrays, nested objects)
- `yamlParser`: Preserves native YAML types
- All throw `ParserError` on invalid syntax

---

## Error Classes

**Purpose**: Structured errors for different failure modes.

**Exports**:
```typescript
export class ConfigError extends Error {
  readonly code: string;
}

export class StructureError extends ConfigError {
  readonly key: string;
  readonly expected: string; // "number", "object", etc.
  readonly actual: string;
}

export class ValidationError extends ConfigError {
  readonly details: unknown; // from validator callback
}

export class ParserError extends ConfigError {
  readonly file: string;
  readonly cause: Error;
}
```

**Contract Guarantees**:
- All errors extend `ConfigError` for easy catching
- Error messages include actionable details (key name, expected vs actual type, suggestions)
- `cause` field preserves original error for debugging

---

## Deprecations & Breaking Changes

**v1.0.0**:
- Initial stable release
- No deprecations yet

**Future considerations** (not committed):
- Async source loading (currently all sync)
- Hot reload / watch mode (currently load-once)
- Nested schema classes (currently flat key space with dot notation)
