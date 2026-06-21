# Tasks: InsaneEnv - Next-Generation Environment Management Library

**Input**: Design documents from `/specs/001-insane-env-library/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Included — TDD is mandatory per constitution (Test-First Development is NON-NEGOTIABLE)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Turborepo monorepo with 3 packages under `packages/`:
- `packages/core/` — Core library (framework-agnostic)
- `packages/nestjs/` — NestJS adapter
- `packages/aws/` — AWS Secrets Manager adapter (deferred to post-MVP)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Monorepo initialization and basic structure

- [ ] T001 Initialize Turborepo monorepo with workspace at root package.json
- [ ] T002 Create packages/core/ with package.json, tsconfig.json, and src/ structure
- [ ] T003 [P] Create packages/nestjs/ with package.json, tsconfig.json, and src/ structure
- [ ] T004 [P] Setup shared TypeScript config at tsconfig.base.json
- [ ] T005 [P] Setup Vitest config at vitest.config.ts (shared)
- [ ] T006 [P] Setup ESLint config at .eslintrc.js
- [ ] T007 [P] Setup tsup build config for packages/core/
- [ ] T008 [P] Setup tsup build config for packages/nestjs/
- [ ] T009 Configure Turborepo pipeline in turbo.json (build, test, lint tasks)
- [ ] T010 Create root README.md with monorepo overview and quick start

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 [P] Create error classes in packages/core/src/errors/config-error.ts
- [ ] T012 [P] Create StructureError class in packages/core/src/errors/structure-error.ts
- [ ] T013 [P] Create ValidationError class in packages/core/src/errors/validation-error.ts
- [ ] T014 [P] Create ParserError class in packages/core/src/errors/parser-error.ts
- [ ] T015 [P] Implement built-in .env parser in packages/core/src/parsers/env-parser.ts (using dotenv)
- [ ] T016 [P] Implement built-in JSON parser in packages/core/src/parsers/json-parser.ts
- [ ] T017 [P] Implement built-in YAML parser in packages/core/src/parsers/yaml-parser.ts (using js-yaml)
- [ ] T018 [P] Define parser interface contract in packages/core/src/parsers/parser-interface.ts
- [ ] T019 Define core types (ConfigSource, LoadConfigOptions) in packages/core/src/loaders/types.ts
- [ ] T020 [P] Define schema type utilities in packages/core/src/schema/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Type-Safe Environment Access (Priority: P1) 🎯 MVP

**Goal**: Enable type-safe, immutable configuration access from a single source with schema validation

**Independent Test**: Load config from .env with a schema class, access values via `InsaneEnv.get()`, verify types are correct and object is frozen

### Tests for User Story 1 (TDD - Write FIRST, ensure FAIL before implementation)

- [ ] T021 [P] [US1] Unit test for schema structure validation in packages/core/tests/unit/schema-validator.test.ts
- [ ] T022 [P] [US1] Unit test for Object.freeze immutability in packages/core/tests/unit/immutability.test.ts
- [ ] T023 [P] [US1] Integration test for single .env source loading in packages/core/tests/integration/single-source.test.ts
- [ ] T024 [P] [US1] Integration test for structure error on missing key in packages/core/tests/integration/error-cases.test.ts
- [ ] T025 [P] [US1] Contract test for core API `loadConfig()` signature in packages/core/tests/contract/load-config.test.ts
- [ ] T026 [P] [US1] Contract test for `InsaneEnv.get()` singleton access in packages/core/tests/contract/singleton-access.test.ts

### Implementation for User Story 1

- [ ] T027 [P] [US1] Implement schema validator in packages/core/src/schema/schema-validator.ts (structure checks only, no value validation)
- [ ] T028 [P] [US1] Implement source merger with precedence logic in packages/core/src/loaders/source-merger.ts
- [ ] T029 [US1] Implement core loadConfig() function in packages/core/src/loaders/config-loader.ts (depends on T027, T028)
- [ ] T030 [US1] Implement singleton instance manager in packages/core/src/instance/singleton.ts (global InsaneEnv.get() access)
- [ ] T031 [US1] Implement instance manager for named instances in packages/core/src/instance/instance-manager.ts
- [ ] T032 [US1] Create public API exports in packages/core/src/index.ts
- [ ] T033 [US1] Add descriptive error messages to all error classes (key name, expected type, actual value, suggestions)
- [ ] T034 [US1] Add Object.freeze enforcement to config-loader.ts before returning merged config

**Checkpoint**: User Story 1 fully functional - type-safe access from single source, immutable, structure-validated

---

## Phase 4: User Story 2 - Multi-Format Configuration Loading (Priority: P2)

**Goal**: Support .env, .yaml, .json sources with precedence-based merging and custom parsers

**Independent Test**: Load config from multiple sources (.env + .yaml + .json), verify precedence (later overrides earlier), verify custom parser works

### Tests for User Story 2 (TDD - Write FIRST)

- [ ] T035 [P] [US2] Integration test for multi-source precedence in packages/core/tests/integration/multi-source.test.ts
- [ ] T036 [P] [US2] Integration test for custom parser in packages/core/tests/integration/custom-parser.test.ts
- [ ] T037 [P] [US2] Unit test for each built-in parser in packages/core/tests/unit/parsers.test.ts
- [ ] T038 [P] [US2] Integration test for defaults object fallback in packages/core/tests/integration/defaults.test.ts

### Implementation for User Story 2

- [ ] T039 [US2] Add multi-source merge logic to source-merger.ts (already created in US1, extend for multiple sources)
- [ ] T040 [US2] Add defaults option support to config-loader.ts (merge at lowest precedence)
- [ ] T041 [US2] Add custom parser support to config-loader.ts (optional parser per source)
- [ ] T042 [US2] Create test fixtures (sample .env, .yaml, .json files) in packages/core/tests/fixtures/
- [ ] T043 [US2] Update core API exports in packages/core/src/index.ts to expose parser interfaces

**Checkpoint**: Multi-format loading works, precedence correct, custom parsers supported, defaults fill gaps

---

## Phase 5: User Story 3 - NestJS Dependency Injection Integration (Priority: P2)

**Goal**: NestJS DynamicModule with DI support, coexisting with global singleton access

**Independent Test**: Import InsaneEnvModule.forRoot() in NestJS app, inject InsaneEnvService, verify DI and global access return identical values

### Tests for User Story 3 (TDD - Write FIRST)

- [ ] T044 [P] [US3] Integration test for DI access in packages/nestjs/tests/integration/di-access.test.ts
- [ ] T045 [P] [US3] Integration test for global + DI coexistence in packages/nestjs/tests/integration/global-access.test.ts
- [ ] T046 [P] [US3] Integration test for multi-instance injection in packages/nestjs/tests/integration/multi-instance.test.ts
- [ ] T047 [P] [US3] Contract test for InsaneEnvModule.forRoot() signature in packages/nestjs/tests/contract/module-api.test.ts

### Implementation for User Story 3

- [ ] T048 [P] [US3] Implement InsaneEnvService in packages/nestjs/src/insane-env.service.ts
- [ ] T049 [P] [US3] Define injection tokens in packages/nestjs/src/tokens.ts
- [ ] T050 [US3] Implement InsaneEnvModule.forRoot() DynamicModule in packages/nestjs/src/insane-env.module.ts
- [ ] T051 [US3] Implement InsaneEnvModule.forFeature() for named instances in packages/nestjs/src/insane-env.module.ts
- [ ] T052 [US3] Create test NestJS module fixture in packages/nestjs/tests/fixtures/test.module.ts
- [ ] T053 [US3] Create public API exports in packages/nestjs/src/index.ts
- [ ] T054 [US3] Update packages/nestjs/README.md with usage examples

**Checkpoint**: NestJS integration complete, DI and global access work identically, named instances supported

---

## Phase 6: User Story 5 - Multi-Instance Environment Declaration (Priority: P3)

**Goal**: Support multiple isolated configuration instances for different application contexts

**Independent Test**: Create two instances with different schemas and sources, verify isolation and correct routing

### Tests for User Story 5 (TDD - Write FIRST)

- [ ] T055 [P] [US5] Unit test for instance isolation in packages/core/tests/unit/instance-manager.test.ts
- [ ] T056 [P] [US5] Integration test for named instance access in packages/core/tests/integration/named-instances.test.ts

### Implementation for User Story 5

- [ ] T057 [US5] Extend instance-manager.ts to support named instances (already created in US1, verify full isolation)
- [ ] T058 [US5] Add named instance parameter to InsaneEnv.get() in singleton.ts
- [ ] T059 [US5] Update core API to expose named instance creation in packages/core/src/index.ts

**Checkpoint**: Multiple isolated instances work, each with independent schema and sources

---

## Phase 7: Validation Callback Support (Cross-Cutting for US1)

**Goal**: Optional library-agnostic validation callback runs after merge, before freeze

**Independent Test**: Pass validator callback that rejects out-of-range values, verify ValidationError thrown with callback details

### Tests (TDD - Write FIRST)

- [ ] T060 [P] Integration test for validation callback success in packages/core/tests/integration/validation.test.ts
- [ ] T061 [P] Integration test for validation callback failure in packages/core/tests/integration/validation.test.ts

### Implementation

- [ ] T062 Implement callback runner in packages/core/src/validation/callback-runner.ts
- [ ] T063 Integrate callback runner into config-loader.ts (run after merge, before freeze)
- [ ] T064 Update LoadConfigOptions type to include optional validator in packages/core/src/loaders/types.ts

**Checkpoint**: Validation callback works, library-agnostic, throws ValidationError on failure

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T065 [P] Add comprehensive TSDoc comments to all public APIs in packages/core/src/
- [ ] T066 [P] Add comprehensive TSDoc comments to all public APIs in packages/nestjs/src/
- [ ] T067 [P] Create packages/core/README.md with installation, usage examples, and API reference
- [ ] T068 [P] Create packages/nestjs/README.md with NestJS-specific examples
- [ ] T069 [P] Add unit tests for error message quality in packages/core/tests/unit/errors.test.ts
- [ ] T070 [P] Add unit tests for sensitive value masking in packages/core/tests/unit/masking.test.ts
- [ ] T071 Implement sensitive value masking in config-loader.ts (mask passwords, tokens in error messages)
- [ ] T072 Add debug logging to config-loader.ts (configuration loading process with verbosity control)
- [ ] T073 Run quickstart.md validation scenarios (all 7 scenarios from quickstart.md)
- [ ] T074 [P] Performance audit: verify <100ms file loading per performance goals
- [ ] T075 [P] Security audit: verify no secrets logged, structure validation correct
- [ ] T076 Code cleanup and refactoring across all packages
- [ ] T077 [P] Update root README.md with monorepo structure, quick start, and package links

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - MVP candidate
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 implementation (extends core loader)
- **User Story 3 (Phase 5)**: Depends on Foundational + US1 (uses core loadConfig)
- **User Story 5 (Phase 6)**: Depends on Foundational + US1 (extends instance manager)
- **Validation (Phase 7)**: Depends on US1 (integrates into config-loader)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

**Note**: User Story 4 (AWS Secrets Manager) explicitly deferred to post-MVP per user instruction.

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational - fully independent
- **US2 (P2)**: Extends US1 (source-merger, config-loader) but independently testable
- **US3 (P2)**: Uses US1 core but independently testable (separate package)
- **US5 (P3)**: Extends US1 (instance-manager) but independently testable

### Within Each User Story

- Tests MUST be written FIRST and FAIL before implementation (TDD mandatory per constitution)
- Models/types before services
- Services before loaders
- Loaders before public API
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All tests for a user story marked [P] can run in parallel
- US3 (NestJS package) can be worked in parallel with US2 extensions once US1 core is stable
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write first):
Task T021: "Unit test for schema structure validation"
Task T022: "Unit test for Object.freeze immutability"
Task T023: "Integration test for single .env source loading"
Task T024: "Integration test for structure error on missing key"
Task T025: "Contract test for core API loadConfig()"
Task T026: "Contract test for InsaneEnv.get() singleton access"

# After tests written and failing, launch implementation tasks in parallel:
Task T027: "Implement schema validator"
Task T028: "Implement source merger with precedence logic"
# Then sequential (T029 depends on T027, T028):
Task T029: "Implement core loadConfig() function"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Monorepo structure ready
2. Complete Phase 2: Foundational → Parsers, errors, types ready (CRITICAL)
3. Complete Phase 3: User Story 1 → Basic type-safe access complete
4. **STOP and VALIDATE**: Run quickstart.md Scenario 1, verify type safety and immutability
5. Publish `@insane-env/core@0.1.0` (MVP!)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Publish v0.1.0 (MVP!)
3. Add User Story 2 → Test independently → Publish v0.2.0 (multi-format support)
4. Add User Story 3 → Test independently → Publish v0.3.0 (NestJS adapter)
5. Add User Story 5 → Test independently → Publish v0.4.0 (multi-instance)
6. Polish → Publish v1.0.0 (stable release)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (pair on critical path)
2. Once Foundational is done:
   - Developer A: User Story 1 (core)
   - Developer B: User Story 3 (NestJS package, in parallel once US1 API stable)
3. After US1 complete:
   - Developer A: User Story 2 (extends core)
   - Developer B: User Story 5 (extends instance manager)
4. Both: Polish tasks in parallel

---

## Notes

- [P] tasks = different files, no dependencies - safe to parallelize
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- TDD is mandatory per constitution: tests MUST be written first and FAIL before implementation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `pnpm test` after each implementation task to verify tests pass
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- AWS adapter (US4) explicitly deferred to post-MVP - revisit after v1.0.0 stable
