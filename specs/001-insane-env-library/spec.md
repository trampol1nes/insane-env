# Feature Specification: InsaneEnv - Next-Generation Environment Management Library

**Feature Branch**: `001-insane-env-library`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "xây dựng InsaneEnv như một thư viện quản lý env thế hệ mới với các mục tiêu: Type-safe, Immutable, Có validation tùy chọn, Tích hợp tốt với NestJS, Hỗ trợ nhiều định dạng file (.env, .yaml, .json), Hỗ trợ secret manager (AWS Secrets Manager), Hỗ trợ Global Env access or DI env access, Hỗ trợ đăng ký/khai báo biến Env bằng 1 hoặc nhiều instances"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Type-Safe Environment Access (Priority: P1)

As a Node.js developer, I want to access environment variables with type safety and validation so that configuration errors are caught at startup rather than at runtime.

**Why this priority**: This is the core value proposition - type-safe environment access eliminates an entire class of production bugs. Without this, the library has no foundation.

**Independent Test**: Can be fully tested by configuring environment variables, accessing them through InsaneEnv, and verifying that type coercion and validation work correctly. Delivers immediate value as a drop-in replacement for `process.env`.

**Acceptance Scenarios**:

1. **Given** environment variable `PORT=3000` is set and loader coerces it to number, **When** user calls `InsaneEnv.get('PORT')`, **Then** returns number `3000` (not string)
2. **Given** environment variable `ENABLE_FEATURE=true` is set and loader coerces it to boolean, **When** user calls `InsaneEnv.get('ENABLE_FEATURE')`, **Then** returns boolean `true`
3. **Given** required configuration key `DATABASE_URL` is missing from loader output, **When** application starts, **Then** throws structure error with clear message indicating which key is missing
4. **Given** loader returns invalid structure (object where schema expects scalar), **When** configuration loads, **Then** throws structure error indicating type mismatch
5. **Given** configuration loaded and frozen, **When** user attempts to modify the returned config object, **Then** modification is prevented (immutable)

---

### User Story 2 - Multi-Format Configuration Loading with Custom Adapters (Priority: P2)

As a developer, I want to load configuration from .env, .yaml, or .json files using custom loader functions per format so that I maintain full control over type coercion while the library handles file parsing and merging.

**Why this priority**: Flexible source loading with explicit type control is critical for type safety. This prevents the library from making incorrect assumptions about type coercion while still supporting multiple formats.

**Independent Test**: Can be tested by creating config files in each format, writing loader functions that coerce raw values to schema types, calling `InsaneEnv.loadConfig()` with source descriptors, and verifying the merged output matches expected types.

**Acceptance Scenarios**:

1. **Given** a `.env` file with `PORT=3000`, **When** loader function applies `+process.env.PORT` coercion and InsaneEnv merges sources, **Then** configuration contains `PORT` as number `3000`
2. **Given** a `config.yaml` file with `PORT: "3000"` (string in YAML), **When** loader function applies `+values.PORT` coercion, **Then** configuration contains `PORT` as number `3000`
3. **Given** a `config.json` file with `PORT: 3000` (already number), **When** loader function applies `+values.PORT` (redundant but harmless), **Then** configuration contains `PORT` as number `3000`
4. **Given** multiple sources (.env, .yaml, .json) in precedence order, **When** InsaneEnv merges them, **Then** later sources override earlier ones and all values match schema types
5. **Given** a source with custom parser (e.g., TOML), **When** user provides parser and loader functions, **Then** InsaneEnv loads and merges the source like built-in formats

---

### User Story 3 - NestJS Dependency Injection Integration (Priority: P2)

As a NestJS developer, I want to inject environment configuration through NestJS's DI system so that my services can access configuration in a testable and idiomatic way.

**Why this priority**: NestJS is a major enterprise framework - seamless integration is critical for adoption in that ecosystem.

**Independent Test**: Can be tested by creating a NestJS module, injecting InsaneEnvService, and verifying configuration access works through both DI and global access patterns.

**Acceptance Scenarios**:

1. **Given** InsaneEnvModule is imported into NestJS app, **When** service constructor requests `InsaneEnvService`, **Then** service receives configured instance
2. **Given** InsaneEnvService is injected, **When** service calls `this.insaneEnvService.get('database.port')`, **Then** returns typed configuration value
3. **Given** InsaneEnv module is configured, **When** any code calls `InsaneEnv.get('database.port')` globally, **Then** returns same value as DI approach
4. **Given** test environment, **When** developer overrides configuration for tests, **Then** both DI and global access reflect test configuration

---

### User Story 4 - AWS Secrets Manager Integration (Priority: P3)

As a cloud developer, I want to load sensitive configuration from AWS Secrets Manager so that secrets are never stored in code or environment files.

**Why this priority**: Secret management is critical for production deployments but is not needed for basic library functionality. Teams can adopt the library without AWS initially.

**Independent Test**: Can be tested with AWS LocalStack or mocked AWS SDK, loading secrets from Secrets Manager and verifying they merge correctly with other configuration sources.

**Acceptance Scenarios**:

1. **Given** AWS credentials configured, **When** InsaneEnv initializes with AWS Secrets Manager source, **Then** fetches secrets successfully
2. **Given** secret exists in AWS Secrets Manager, **When** configuration loads, **Then** secret values override file-based configuration
3. **Given** AWS Secrets Manager is unavailable, **When** InsaneEnv loads with optional flag, **Then** application continues with fallback configuration and logs warning
4. **Given** secret format is JSON, **When** InsaneEnv loads secret, **Then** parses JSON and flattens keys for dot notation access

---

### User Story 5 - Multi-Instance Environment Declaration (Priority: P3)

As an architect, I want to register multiple environment configurations for different application contexts (e.g., app config vs. worker config) so that each service component has appropriate configuration boundaries.

**Why this priority**: Advanced use case for complex applications. Most applications start with single configuration instance. Enables sophisticated architectures but not essential for MVP.

**Independent Test**: Can be tested by creating multiple InsaneEnv instances with different schemas and sources, verifying isolation between instances and correct routing of configuration access.

**Acceptance Scenarios**:

1. **Given** two InsaneEnv instances (`appEnv` and `workerEnv`), **When** each loads different configuration, **Then** instances remain isolated
2. **Given** multiple named instances, **When** user calls `InsaneEnv.get('key', 'appEnv')`, **Then** returns value from named instance
3. **Given** default instance and named instances, **When** user calls `InsaneEnv.get('key')` without instance name, **Then** returns value from default instance
4. **Given** NestJS module with multiple instances, **When** services inject by token, **Then** each service receives correct instance

---

### Edge Cases

- What happens when environment variable exists but is empty string vs. undefined?
- How does the system handle circular references in YAML/JSON configuration files?
- What happens when type coercion fails (e.g., `PORT=abc` when number expected)?
- How does the system handle very large configuration files (>1MB)?
- What happens when AWS Secrets Manager times out or returns throttling errors?
- How does the system handle configuration changes after application starts (hot reload scenarios)?
- What happens when multiple configuration sources define the same key with different types?
- How are nested object keys handled in .env file format (which doesn't natively support nesting)?
- What happens when validation schema requires a key but all sources are optional?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST load configuration from `process.env` by default
- **FR-002**: System MUST parse and load `.env` files with support for comments and multiline values
- **FR-003**: System MUST parse and load YAML files with nested object support
- **FR-004**: System MUST parse and load JSON files with type preservation
- **FR-005**: User-provided loader functions MUST perform type coercion from raw source values to schema-defined types
- **FR-006**: System MUST accept schema class defining expected types for each configuration key
- **FR-007**: System MUST validate merged configuration against schema class structure (canonical key set and scalar vs. object form)
- **FR-008**: System MUST throw error when loader output is missing a key declared in schema class
- **FR-009**: System MUST throw error when loader output provides object where schema expects scalar, or vice versa
- **FR-010**: System MUST accept optional validation callback function that receives merged configuration and can throw errors or return validation result
- **FR-011**: System MUST accept optional defaults object providing fallback values for keys missing from all sources
- **FR-012**: System MUST freeze configuration object to prevent runtime mutations
- **FR-013**: System MUST support dot notation for accessing nested configuration values (e.g., `database.host`)
- **FR-014**: System MUST throw descriptive errors when required configuration is missing
- **FR-015**: System MUST throw descriptive errors when configuration fails validation
- **FR-016**: System MUST support per-source loader functions that transform raw parsed values into schema-typed objects
- **FR-017**: System MUST provide built-in parsers for .env, .json, and .yaml formats
- **FR-018**: System MUST allow custom parsers for unsupported file formats
- **FR-019**: System MUST support NestJS DynamicModule pattern for module registration
- **FR-020**: System MUST provide injectable service for NestJS dependency injection
- **FR-021**: System MUST support global singleton access pattern (`InsaneEnv.get()`)
- **FR-022**: System MUST support named instances for multi-context applications
- **FR-023**: System MUST integrate with AWS Secrets Manager to fetch secrets
- **FR-024**: System MUST support configuration source precedence with later sources overriding earlier ones
- **FR-025**: System MUST handle AWS Secrets Manager connection failures gracefully with fallback behavior
- **FR-026**: System MUST provide clear error messages indicating which configuration key failed and why
- **FR-027**: System MUST support environment-specific configuration files (e.g., `.env.development`, `.env.production`)
- **FR-028**: System MUST expose TypeScript types derived from schema class for configuration access with full autocomplete support
- **FR-029**: Loader functions MUST handle array type coercion explicitly (e.g., comma-separated string to array)
- **FR-030**: System MUST support configuration enrichment from non-environment sources (e.g., package.json metadata)
- **FR-031**: System MUST support configuration caching to avoid repeated file/AWS reads
- **FR-032**: System MUST log configuration loading process with debug-level verbosity
- **FR-033**: System MUST mask sensitive values in logs and error messages
- **FR-034**: Validation callback MUST be library-agnostic (user chooses validation library: Zod, Joi, Yup, custom)

### Key Entities

- **Schema Class**: A user-defined class that declares the canonical type for each configuration key. Used at runtime to verify loader output structure (key existence and scalar vs. object form) and to derive TypeScript types for autocomplete. Does NOT perform validation or provide defaults — those are separate concerns.

- **Configuration Source**: A source descriptor with type (`.env`, `.json`, `.yaml`, custom), file path, optional custom parser, and loader function. The loader receives parsed values and coerces them to match the schema class types.

- **Loader Function**: A user-provided function (per source) that transforms raw parsed values into schema-typed configuration object. Responsible for all type coercion (e.g., `+value` for number, `.split(',')` for array, `=== 'true'` for boolean).

- **Parser**: Reads a file and returns raw object. Built-in parsers provided for `.env`, `.json`, `.yaml`. Users can provide custom parsers for other formats.

- **Defaults Object**: Optional fallback values for keys missing from all sources. Merged at lowest precedence before schema validation.

- **Validation Callback**: An optional, user-supplied function that receives the merged configuration and validates it. The library imposes no validation library — the user may use Zod, Joi, Yup, or hand-written checks. The callback signals failure by throwing or returning a validation result.

- **Configuration Value**: Represents a single configuration item with key, typed value, source origin, and metadata (whether it was coerced, validated, or uses default).

- **Environment Instance**: Represents an isolated configuration context with unique name, schema class, sources, defaults, cached configuration object, and optional validation callback. Multiple instances can coexist.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can replace `process.env.KEY` with `InsaneEnv.get('KEY')` and get type-safe access with zero configuration
- **SC-002**: Configuration errors are caught at application startup with descriptive messages (100% of type/required violations detected before runtime)
- **SC-003**: Library loads configuration from .env, YAML, and JSON files without requiring different APIs (single `load()` method handles all formats)
- **SC-004**: NestJS applications can inject configuration through DI with full TypeScript autocomplete
- **SC-005**: Configuration object is completely immutable at runtime (Object.isFrozen() returns true)
- **SC-006**: AWS Secrets Manager integration fetches secrets within 2 seconds under normal conditions
- **SC-007**: Error messages include the configuration key name, expected type, actual value, and suggestion for resolution
- **SC-008**: Library supports monorepo architectures with multiple independent configuration instances without conflicts
- **SC-009**: Configuration loading completes in under 100ms for file-based sources (excluding network calls)
- **SC-010**: Library has zero runtime dependencies on frameworks (core package is framework-agnostic)
- **SC-011**: Documentation provides migration path from `process.env` and `@nestjs/config` with code examples
- **SC-012**: 90% of common configuration patterns work without custom validation functions

## Assumptions

- Target users are Node.js/TypeScript developers building backend services and APIs
- Developers are familiar with environment variable conventions and configuration management concepts
- Applications using this library are primarily server-side (not browser-based)
- AWS SDK is available when using AWS Secrets Manager integration (peer dependency)
- NestJS integration requires NestJS v8+ (uses modern DynamicModule patterns)
- Configuration is loaded once at application startup (hot-reload is out of scope for v1)
- TypeScript is the primary development language (JavaScript support is secondary)
- Configuration files are UTF-8 encoded
- Environment variable names follow standard conventions (uppercase, underscores, alphanumeric)
- Existing authentication mechanisms handle AWS credentials (library uses AWS SDK default credential chain)
- Configuration size is reasonable for in-memory storage (under 10MB total)
- Validation schemas are defined using industry-standard libraries (Zod recommended, but pluggable)
- Monorepo architecture uses Turborepo or similar tooling supporting shared packages
- Core package (`@insane-env/core`) has no dependency on NestJS or AWS SDK
- NestJS adapter (`@insane-env/nestjs`) depends on core and NestJS
- AWS adapter (`@insane-env/aws`) depends on core and AWS SDK
- Semantic versioning is followed for all packages
- Breaking changes between major versions are acceptable during v0.x phase
