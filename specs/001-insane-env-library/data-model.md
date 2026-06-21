# Data Model: InsaneEnv

**Date**: 2026-06-21 | **Plan**: [plan.md](./plan.md)

This document defines the core entities in the InsaneEnv system. These are conceptual entities, not necessarily 1:1 with classes (implementation details belong in tasks.md).

---

## Schema Class

**Purpose**: User-defined class declaring the canonical type for each configuration key.

**Attributes**:
- Key names (class properties)
- Type per key (inferred from property declaration: `number`, `string`, `boolean`, `Array<T>`, nested object)

**Relationships**:
- Referenced by `loadConfig()` to validate structure (key existence, scalar vs. object form)
- TypeScript derives autocomplete types from this class

**Validation Rules**:
- Must be a runtime-available class (not interface)
- Properties must have types (cannot be `any`)

**State/Lifecycle**: Static — defined once per application, immutable at runtime.

**Example**:
```typescript
class AppConfigSchema {
  SERVER_PORT: number;
  API_PREFIX: string;
  IS_DEBUG: boolean;
  ALLOWED_ORIGINS: string[];
}
```

---

## Configuration Source

**Purpose**: Descriptor for one source of configuration data (file, process.env, AWS secret).

**Attributes**:
- `type`: Source format (`.env`, `.json`, `.yaml`, `custom`)
- `file`: File path (optional if source is process.env)
- `parser`: Custom parser function (optional, falls back to built-in)
- `loader`: User-provided function transforming raw parsed values into schema-typed object

**Relationships**:
- Consumed by `loadConfig()` in precedence order
- Loader function references Schema Class for coercion target types

**Validation Rules**:
- `loader` must return object matching Schema Class structure
- `parser` must return object (string keys, any values)

**State/Lifecycle**: Defined at config load time, read-only after initialization.

**Example**:
```typescript
{
  type: '.env',
  file: '.env',
  loader: loadMainConfigFromEnv,
  parser: undefined // use built-in
}
```

---

## Loader Function

**Purpose**: User-provided function that coerces raw parsed values into schema-typed values.

**Attributes**:
- Input: Raw object from parser (string values for `.env`, native types for JSON/YAML)
- Output: Object matching Schema Class structure with correct types

**Relationships**:
- One loader per Configuration Source
- References Schema Class implicitly (return type must match)

**Validation Rules**:
- Must return all keys declared in Schema Class
- Returned types must match Schema Class (scalar where schema is scalar, object where schema is object)

**State/Lifecycle**: Invoked once per source during `loadConfig()`.

**Example**:
```typescript
const loadMainConfigFromEnv = () => ({
  SERVER_PORT: +process.env.SERVER_PORT,
  API_PREFIX: process.env.API_PREFIX,
  IS_DEBUG: process.env.IS_DEBUG === 'true',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || []
})
```

---

## Parser

**Purpose**: Reads a file and returns raw key-value object.

**Attributes**:
- Input: File path or buffer
- Output: Object with string keys, any values

**Relationships**:
- Used by Configuration Source before Loader Function runs
- Built-in parsers for `.env`, `.json`, `.yaml`
- User can provide custom parser for other formats

**Validation Rules**:
- Must return plain object (no class instances, no circular references)

**State/Lifecycle**: Invoked once per file source during `loadConfig()`.

**Example** (custom TOML parser):
```typescript
const tomlParser = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  return TOML.parse(content);
}
```

---

## Defaults Object

**Purpose**: Provides fallback values for keys missing from all sources.

**Attributes**:
- Key-value pairs matching a subset of Schema Class keys
- Values are final types (already coerced)

**Relationships**:
- Merged at lowest precedence (sources override defaults)
- Optional — only provided if user passes `defaults` option to `loadConfig()`

**Validation Rules**:
- Keys must exist in Schema Class
- Types must match Schema Class

**State/Lifecycle**: Static, provided at `loadConfig()` time.

**Example**:
```typescript
const defaults = {
  SERVER_PORT: 3000,
  API_PREFIX: '/api',
  IS_DEBUG: false
}
```

---

## Validation Callback

**Purpose**: Optional user-supplied function that validates merged configuration.

**Attributes**:
- Input: Merged configuration object (post-defaults, post-precedence)
- Output: Throws error or returns validation result

**Relationships**:
- Invoked after all sources merged, before freezing
- Library-agnostic — user brings Zod/Joi/Yup/custom

**Validation Rules**:
- Must be synchronous (async validation not supported in v1)

**State/Lifecycle**: Invoked once during `loadConfig()`, after merge.

**Example** (Zod):
```typescript
const validator = (config: unknown) => {
  const schema = z.object({
    SERVER_PORT: z.number().min(1).max(65535),
    API_PREFIX: z.string().startsWith('/'),
    IS_DEBUG: z.boolean()
  });
  return schema.parse(config);
}
```

---

## Configuration Value

**Purpose**: A single resolved configuration item after merge and validation.

**Attributes**:
- `key`: Configuration key name
- `value`: Typed value (number, string, boolean, array, object)
- `source`: Origin source (which file/process.env)
- `metadata`: Was it coerced? From defaults? Validated?

**Relationships**:
- Part of final frozen Configuration Object
- Accessible via `InsaneEnv.get(key)` or `InsaneEnvService.get(key)`

**Validation Rules**:
- Type must match Schema Class declaration
- Immutable (Object.freeze enforced)

**State/Lifecycle**: Created during merge, frozen before exposure.

---

## Environment Instance

**Purpose**: Isolated configuration context supporting multiple independent configurations.

**Attributes**:
- `name`: Instance identifier (e.g., 'app', 'worker')
- `schemaClass`: Schema Class reference
- `sources`: Array of Configuration Sources
- `defaults`: Optional Defaults Object
- `validator`: Optional Validation Callback
- `config`: Cached frozen configuration object

**Relationships**:
- One instance per `loadConfig()` invocation
- Multiple instances can coexist (named or default)
- NestJS adapter creates instances per module import

**Validation Rules**:
- Name must be unique within process
- Schema Class required
- At least one source required

**State/Lifecycle**: Created at `loadConfig()`, cached until process exit.

**Example**:
```typescript
InsaneEnv.loadConfig([...sources], {
  schema: AppConfigSchema,
  defaults,
  validator,
  name: 'app' // optional, default is 'default'
})
```

---

## Relationships Summary

```
Schema Class ──defines types for──> Loader Function
Configuration Source ──uses──> Parser ──then──> Loader Function
Loader Function ──returns──> Configuration Value (pre-merge)
Multiple Configuration Values ──merged by precedence──> Final Config
Defaults Object ──lowest precedence──> Final Config
Final Config ──validated by──> Validation Callback
Final Config ──frozen──> Environment Instance
Environment Instance ──exposes──> Configuration Value (via get())
```
