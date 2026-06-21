# Insane-Env Constitution

## Core Principles

### I. Clean Code Above All
Every line of code must be written with the next developer in mind. Code is read far more often than it is written.

- **Self-documenting code**: Names reveal intent; functions do one thing; abstractions match mental models
- **No clever tricks**: Clarity beats brevity; explicit beats implicit; boring beats clever
- **Single Responsibility**: Every module, class, and function has exactly one reason to change
- **DRY (Don't Repeat Yourself)**: Duplication is debt; extract shared logic immediately
- **YAGNI (You Aren't Gonna Need It)**: Build for today's requirements, not tomorrow's possibilities

### II. Test-First Development (NON-NEGOTIABLE)
Tests are not optional. They are the specification, the safety net, and the documentation.

- **TDD mandatory**: Write failing test → User approves → Implement → Refactor
- **Test coverage gates**: New code requires tests; coverage cannot decrease
- **Test clarity**: Test names describe behavior; assertions are obvious; no test mystery
- **Fast feedback**: Unit tests run in milliseconds; integration tests under 5s; CI under 10m
- **Test as documentation**: Tests show how to use the API; examples live in tests

### III. Architectural Clarity
Every component knows its place and purpose. Dependencies flow one direction.

- **Layer separation**: Presentation → Application → Domain → Infrastructure; never backward
- **Dependency injection**: Dependencies injected, not imported; testable by design
- **Interface-driven**: Depend on contracts, not implementations; easy to swap
- **Domain-first**: Business logic isolated from frameworks, databases, UI
- **Explicit boundaries**: Modules communicate through defined APIs, never reaching inside

### IV. Simplicity as a Virtue
Complexity is a cost. Every abstraction must pay its way.

- **Boring technology**: Proven tools over shiny ones; fewer moving parts
- **Minimal abstractions**: Three concrete examples before extracting; one caller isn't enough
- **Flat is better than nested**: Shallow hierarchies; obvious paths; no treasure hunts
- **Delete before adding**: Remove unused code immediately; complexity accumulates silently
- **Configuration minimalism**: Sensible defaults; configuration only when genuinely variable

### V. Maintainability by Design
The codebase should get easier to change over time, not harder.

- **Small, focused PRs**: Changes under 400 lines; one concept per PR; easy to review
- **No broken windows**: Fix rot immediately; technical debt compounds exponentially
- **Refactor relentlessly**: Clean as you go; leave code better than you found it
- **Documentation as code**: README explains setup in 5 steps; architecture diagrams in repo; runbooks versioned
- **Error messages help**: Errors explain what went wrong, why, and how to fix it

## Development Standards

### Code Quality

**Readability checklist:**
- Can a junior developer understand this in 2 minutes?
- Are names unambiguous without context?
- Is the happy path obvious at a glance?
- Would this survive a 6-month context switch?

**Complexity limits:**
- Functions/methods: max 300 lines, max 3 levels of nesting
- Files: max 1000 lines; split sooner if cohesion is lost
- Cyclomatic complexity: max 10 per function
- Modules: max 7 public exports (Miller's Law)

**Naming conventions:**
- Functions: verbs (`fetchUser`, `calculateTotal`, `isValid`)
- Classes: nouns (`UserRepository`, `OrderProcessor`)
- Booleans: questions (`isReady`, `hasPermission`, `canDelete`)
- Constants: screaming snake case (`MAX_RETRIES`, `API_BASE_URL`)

### Testing Standards

**Required test types:**
- **Unit tests**: Every pure function, every business rule
- **Integration tests**: API contracts, database interactions, service boundaries
- **E2E tests**: Critical user flows only; keep count under 20

**Test structure:**
- **Arrange-Act-Assert**: Setup → Execute → Verify; one assertion focus per test
- **Given-When-Then**: Scenario-based; readable by non-developers
- **No test interdependence**: Tests run in any order; each test isolated

**Coverage requirements:**
- **Critical paths**: 100% coverage (auth, payments, data integrity)
- **Business logic**: 90% coverage minimum
- **UI/glue code**: 70% coverage target
- **Mutation testing**: 80% mutation score on critical code

### Code Review Standards

**Every PR must answer:**
1. What problem does this solve? (Link to issue/spec)
2. What approach was taken? (And why over alternatives)
3. What could break? (Edge cases, deployment risks)
4. How was it tested? (Manual steps + automated tests)

**Review checklist:**
- [ ] Tests written before implementation
- [ ] No duplication introduced
- [ ] Error handling covers failure modes
- [ ] Documentation updated (API docs, README, architecture diagrams)
- [ ] No new warnings or linter violations
- [ ] Breaking changes flagged and versioned

**Approval gates:**
- One approval required for routine changes
- Two approvals for breaking changes, security, or architecture shifts
- Architectural Decision Records (ADRs) for design choices affecting >3 modules

## Security Requirements

**Non-negotiable:**
- All secrets in environment variables or secrets manager (AWS Secrets Manager, Vault)
- Input validation on all external boundaries (Zod schemas required)
- Parameterized queries only; no string interpolation in SQL
- HTTPS everywhere; no HTTP in production
- Rate limiting on all public endpoints (429 responses)
- Authentication before authorization (fail closed, never open)

**Dependency management:**
- Automated security scans on every PR (Snyk, Dependabot)
- Critical vulnerabilities block merge
- Monthly dependency updates (patch versions weekly)

## Workflow Standards

### Git Workflow

**Branch strategy:**
- `main` is production; always deployable
- `develop` for integration; feature branches merge here first
- Feature branches: `feature/short-kebab-description`
- Hotfix branches: `hotfix/issue-number-description`

**Commit standards:**
- Conventional Commits format: `type(scope): description`
- Types: `feat|fix|docs|style|refactor|test|chore`
- Commits under 50 chars; body explains why, not what
- No "WIP" or "fix typo" commits on main

**Merge requirements:**
- All tests pass (unit + integration + E2E)
- No linter violations
- Coverage gates met
- Required approvals obtained
- Squash merge to keep history clean

### Deployment Standards

**CI/CD pipeline:**
1. Lint → Unit tests → Build → Integration tests → E2E tests
2. Security scan → License check → Coverage report
3. Staging deploy → Smoke tests → Production deploy

**Deployment gates:**
- Staging must be green for 24h before production
- Production deploys only during business hours (rollback capacity)
- Feature flags for risky changes (gradual rollout)

**Observability:**
- Structured logging (JSON) to stdout
- Distributed tracing (OpenTelemetry)
- Metrics for all critical paths (response times, error rates, resource usage)
- Alerts fire before users notice (SLO-based)

## Governance

### Constitution Supremacy
This constitution supersedes all coding conventions, style guides, and team preferences. When in doubt, optimize for maintainability.

**Enforcement:**
- All PRs audited against these principles before merge
- CI gates enforce objective standards (tests, linting, coverage)
- Human review enforces subjective standards (clarity, simplicity, design)

**Amendment process:**
1. Propose change with rationale (why current rule fails)
2. Team discussion (synchronous meeting, not async)
3. Unanimous approval required (constitution is sacred)
4. Migration plan for existing code (if applicable)
5. Update this document with version bump and date

**Exceptions:**
- Must be documented in `EXCEPTIONS.md` with justification
- Require two approvals (one must be a technical lead)
- Include expiration date (temporary only) or deprecation plan

**Guidance:**
For runtime development guidance, see [CLAUDE.md](../../CLAUDE.md). This constitution defines *what* we build; CLAUDE.md guides *how* Claude assists in building it.

---

**Version**: 1.0.0  
**Ratified**: 2026-06-21  
**Last Amended**: 2026-06-21

---

## Rationale

This constitution exists because:

1. **Maintenance costs dominate**: 80% of software cost is maintenance; writing for maintainers is cost reduction
2. **Clarity prevents bugs**: Most bugs are misunderstandings; clear code prevents misunderstandings
3. **Simplicity enables velocity**: Complex systems slow down; simple systems speed up over time
4. **Tests enable confidence**: Fear of changing code kills productivity; tests eliminate fear
5. **Standards eliminate decisions**: Decision fatigue is real; conventions free mental energy for problems that matter

**Target audience**: Future you, six months from now, at 2 AM debugging a production incident. If that person can understand your code in 2 minutes, you succeeded.
