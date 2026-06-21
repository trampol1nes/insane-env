# Implementation Plan: InsaneEnv - Next-Generation Environment Management Library

**Branch**: `001-insane-env-library` | **Date**: 2026-06-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-insane-env-library/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build InsaneEnv as a type-safe, immutable environment configuration library for Node.js/TypeScript. Core architecture: user-defined schema class defines canonical types (Level 0), per-format loader functions perform explicit type coercion (Level 2), library merges sources by precedence and validates structure (Level 3). Supports .env, .yaml, .json sources with custom parsers. Optional validation callback (library-agnostic), optional defaults object, NestJS DI integration, and AWS Secrets Manager support (deferred to post-MVP). Monorepo structure with three packages: `@insane-env/core` (framework-agnostic), `@insane-env/nestjs` (NestJS adapter), `@insane-env/aws` (AWS integration).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), targeting Node.js 18+ (ESM modules)

**Primary Dependencies**: 
- Core: dotenv (built-in .env parser), js-yaml (YAML parser), no runtime framework dependencies
- NestJS adapter: @nestjs/common ^10.0.0, @nestjs/core ^10.0.0
- AWS adapter: @aws-sdk/client-secrets-manager ^3.0.0
- Dev: Vitest (testing), tsup (build), Turborepo (monorepo orchestration)

**Storage**: N/A (in-memory configuration only)

**Testing**: Vitest with strict TDD workflow (test → implement → refactor). Unit tests for all core logic, integration tests for NestJS/AWS adapters, contract tests for public APIs.

**Target Platform**: Node.js 18+ server-side applications (backend services, CLI tools, workers)

**Project Type**: Library (monorepo with 3 packages: core + 2 adapters)

**Performance Goals**: 
- Configuration loading <100ms for file-based sources (excluding network)
- AWS Secrets Manager fetch <2s under normal conditions
- Zero runtime overhead for type access (TypeScript inference only)

**Constraints**:
- Core package: zero runtime dependencies on frameworks (framework-agnostic)
- Immutability enforced via Object.freeze (no mutations post-load)
- Validation callback library-agnostic (user brings Zod/Joi/Yup/custom)
- Schema class runtime introspection for structure validation only (not values)

**Scale/Scope**: 
- Target: 10k+ downloads/month within 6 months
- Support monorepo architectures with multiple isolated instances
- Configuration size <10MB total (reasonable for in-memory storage)
- 3 core packages, extensible architecture for future adapters

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Clean Code Above All
- **Self-documenting code**: Schema class pattern makes types explicit, loader functions show coercion logic clearly
- **No clever tricks**: Explicit loader functions over magic coercion, clear precedence rules
- **Single Responsibility**: Each package has one concern (core/nestjs/aws), each module single-purpose
- **DRY**: Shared parsers in core, adapters reuse core without duplication
- **YAGNI**: Build for current requirements (defer AWS until core proven)

### ✅ Test-First Development (NON-NEGOTIABLE)
- **TDD mandatory**: Vitest with strict test-first workflow enforced
- **Test coverage gates**: 90%+ for core business logic, 100% for critical paths (type coercion, validation)
- **Test clarity**: Each test covers one schema/loader/merge scenario with clear Given-When-Then
- **Fast feedback**: Vitest runs in milliseconds, integration tests <5s, monorepo CI <10m with caching
- **Test as documentation**: Tests show real-world usage patterns for each package

### ✅ Architectural Clarity
- **Layer separation**: Core (domain logic) → Adapters (framework integration), no backward dependencies
- **Dependency injection**: NestJS adapter uses DI, core supports both DI and singleton patterns
- **Interface-driven**: Public APIs defined in contracts/, internal implementations swappable
- **Domain-first**: Config loading logic isolated from NestJS/AWS, testable without frameworks
- **Explicit boundaries**: Packages communicate through published exports only, no internal imports

### ✅ Simplicity as a Virtue
- **Boring technology**: TypeScript, Vitest, Turborepo (proven monorepo tools)
- **Minimal abstractions**: Schema class + loader pattern (2 concepts), no complex inheritance
- **Flat is better than nested**: Package structure 2-3 levels deep maximum
- **Delete before adding**: Start with core only, add adapters when proven necessary
- **Configuration minimalism**: Sensible defaults (process.env source, sync loading), opt-in complexity

### ✅ Maintainability by Design
- **Small, focused PRs**: Each user story maps to independent PR (<400 lines)
- **No broken windows**: Strict linting (ESLint + TypeScript strict mode), format on save
- **Refactor relentlessly**: Extract shared logic into core as patterns emerge across adapters
- **Documentation as code**: README with 5-step setup, architecture diagram in repo, API docs via TSDoc
- **Error messages help**: Descriptive errors with key name, expected type, actual value, suggestion

**Gate Result**: ✅ **PASSED** — No constitution violations. Architecture aligns with all five principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
packages/
├── core/
│   ├── src/
│   │   ├── schema/
│   │   │   ├── schema-validator.ts      # Schema class structure validation
│   │   │   └── types.ts                 # Schema type utilities
│   │   ├── parsers/
│   │   │   ├── env-parser.ts            # Built-in .env parser (dotenv)
│   │   │   ├── json-parser.ts           # Built-in JSON parser
│   │   │   ├── yaml-parser.ts           # Built-in YAML parser (js-yaml)
│   │   │   └── parser-interface.ts      # Custom parser contract
│   │   ├── loaders/
│   │   │   ├── config-loader.ts         # Core loadConfig() implementation
│   │   │   ├── source-merger.ts         # Precedence-based merge logic
│   │   │   └── types.ts                 # Source, Loader types
│   │   ├── instance/
│   │   │   ├── instance-manager.ts      # Multi-instance support
│   │   │   └── singleton.ts             # Global InsaneEnv.get() access
│   │   ├── validation/
│   │   │   └── callback-runner.ts       # Optional validation callback execution
│   │   ├── errors/
│   │   │   ├── config-error.ts          # Base error class
│   │   │   ├── validation-error.ts      # Validation failures
│   │   │   └── structure-error.ts       # Schema structure mismatches
│   │   └── index.ts                     # Public API exports
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── schema-validator.test.ts
│   │   │   ├── parsers.test.ts
│   │   │   ├── config-loader.test.ts
│   │   │   ├── source-merger.test.ts
│   │   │   └── instance-manager.test.ts
│   │   ├── integration/
│   │   │   ├── multi-source.test.ts     # .env + .yaml + .json precedence
│   │   │   ├── validation.test.ts       # Callback integration
│   │   │   └── error-cases.test.ts      # Error message quality
│   │   └── fixtures/
│   │       ├── .env.test
│   │       ├── config.test.json
│   │       └── config.test.yaml
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── nestjs/
│   ├── src/
│   │   ├── insane-env.module.ts         # DynamicModule definition
│   │   ├── insane-env.service.ts        # Injectable service
│   │   ├── tokens.ts                    # Injection tokens for named instances
│   │   └── index.ts                     # Public exports
│   ├── tests/
│   │   ├── integration/
│   │   │   ├── di-access.test.ts        # DI pattern validation
│   │   │   ├── global-access.test.ts    # Global + DI coexistence
│   │   │   └── multi-instance.test.ts   # Named instance injection
│   │   └── fixtures/
│   │       └── test.module.ts           # Test NestJS module
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── aws/
    ├── src/
    │   ├── secrets-manager-source.ts    # AWS Secrets Manager loader
    │   ├── parsers/
    │   │   └── json-secret-parser.ts    # Parse JSON secrets, flatten keys
    │   └── index.ts                     # Public exports
    ├── tests/
    │   ├── integration/
    │   │   ├── secrets-manager.test.ts  # LocalStack integration
    │   │   └── fallback.test.ts         # Connection failure handling
    │   └── fixtures/
    │       └── localstack-config.json
    ├── package.json
    ├── tsconfig.json
    └── README.md

# Monorepo root
├── turbo.json                           # Turborepo pipeline config
├── package.json                         # Workspace definition
├── tsconfig.base.json                   # Shared TypeScript config
├── .eslintrc.js                         # Shared lint rules
├── vitest.config.ts                     # Shared test config
└── README.md                            # Monorepo overview + quick start
```

**Structure Decision**: Turborepo monorepo with 3 independent packages under `packages/`. Core package has zero framework dependencies (pure TypeScript), exports all primitives. NestJS adapter depends on core + @nestjs/* only. AWS adapter depends on core + @aws-sdk/* only. Each package publishes independently to npm with @insane-env/* scope. Shared dev dependencies (Vitest, tsup, ESLint, TypeScript) at root, runtime dependencies scoped per package.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — Constitution Check passed cleanly. This section intentionally left empty.
