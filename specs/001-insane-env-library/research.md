# Phase 0 Research: InsaneEnv

**Date**: 2026-06-21 | **Plan**: [plan.md](./plan.md)

Most technical decisions were settled during spec clarification. This document records the rationale and the alternatives considered.

## Decision: Schema class for type definition (not interface, not Zod schema)

- **Decision**: User defines a class declaring the canonical type per key. Used at runtime only for structure validation (key set, scalar vs. object) and as the source for TypeScript type derivation.
- **Rationale**: Interfaces are erased at compile time so they cannot drive runtime checks; a class survives to runtime. Keeping the class to *type/structure only* (not value validation, not defaults) preserves single responsibility — validation and defaults are separate opt-in concerns.
- **Alternatives considered**: (a) Zod/Joi schema as the type source — rejected because it couples the library to one validation lib, contradicting the library-agnostic goal. (b) Compile-time generic only — rejected because it gives zero runtime structure guarantees.

## Decision: Per-source loader functions own type coercion

- **Decision**: Each source supplies a user-written loader that maps raw parsed values into schema-typed values (`+v`, `v === 'true'`, `v.split(',')`).
- **Rationale**: The library can never reliably guess intended types from string-only `.env` vs. natively-typed YAML/JSON. Putting coercion in explicit loaders makes intent unambiguous and keeps the core format-agnostic.
- **Alternatives considered**: Library-driven coercion from declared types — rejected as the "magic" that breaks down across formats (the core difficulty the user flagged).

## Decision: Built-in parsers + optional custom parser

- **Decision**: Ship parsers for `.env` (dotenv), `.json` (JSON.parse), `.yaml` (js-yaml). Allow a custom `parser` per source for other formats.
- **Rationale**: Covers the three required formats out of the box while staying extensible without core changes.
- **Alternatives considered**: Format auto-detection by extension only — kept as default, but explicit `type` + optional `parser` override wins for predictability.

## Decision: Validation as optional library-agnostic callback

- **Decision**: `loadConfig(..., { validator })` accepts an optional callback receiving merged config; it throws or returns a result. No bundled validation library.
- **Rationale**: Teams already standardize on Zod/Joi/Yup; forcing one is friction. Matches the user's explicit instruction.

## Decision: Defaults as a separate option

- **Decision**: `loadConfig(..., { defaults })` provides lowest-precedence fallback values, distinct from the schema class.
- **Rationale**: Keeps schema concerned only with type/structure; defaults are a values concern.

## Decision: Immutability via Object.freeze

- **Decision**: Freeze the merged config object before exposing it.
- **Rationale**: Prevents runtime drift; satisfies the immutable goal with a zero-dependency primitive.

## Decision: Turborepo + Vitest + tsup

- **Decision**: Turborepo for orchestration, Vitest for tests, tsup for builds.
- **Rationale**: Boring, proven tooling per the constitution; fast feedback for TDD.
- **Alternatives considered**: Nx (heavier), Jest (slower), rollup-by-hand (more config).

## Deferred: AWS Secrets Manager

- **Status**: Explicitly deferred to post-MVP per user instruction ("phần aws để sau"). Requirements remain in spec (FR-023, FR-025 area) but `@insane-env/aws` is not part of MVP scope. Core source interface is designed to accept an async secrets source later without redesign.
