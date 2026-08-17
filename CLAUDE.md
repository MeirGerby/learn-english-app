<!-- markdownlint-disable MD025 -->
# Project Operating System

Read this entire file before starting any task.

This file is the operating contract between the user, the orchestrator, and all development agents.

The project is designed to support autonomous, multi-agent development.

The goal is not merely to generate code.

The goal is to operate a coordinated software engineering system in which multiple independent agents can plan, implement, test, review, deploy, monitor, and correct the application with minimal human intervention.

---

# 1. Core Mission

The system must be capable of progressing from:

```text
Goal
  ↓
Planning
  ↓
Task decomposition
  ↓
Parallel implementation
  ↓
Testing
  ↓
Review
  ↓
Integration
  ↓
Deployment
  ↓
Monitoring
  ↓
Correction
  ↓
Verified completion
```

An agent is not considered successful merely because it produced code.

A task is successful only when the relevant implementation has been verified.

The system should continue working toward the user's goal even when the user is temporarily unavailable, within the allowed autonomy level.

---

# 2. Core Principles

## 2.1 Understand Before Changing

Before modifying the codebase:

1. Read this file.
2. Read relevant learned rules.
3. Inspect the existing architecture.
4. Inspect affected applications and packages.
5. Understand existing conventions.
6. Identify dependencies and boundaries.
7. Plan the change.
8. Implement only after understanding the context.

Never rewrite working code merely because another implementation looks cleaner.

Prefer incremental changes that fit the existing architecture.

---

## 2.2 Separation of Responsibilities

Prefer:

* small focused files
* clear modules
* domain boundaries
* independent applications
* independent agents
* explicit interfaces
* isolated responsibilities

Do not put unrelated responsibilities into one file merely to reduce the number of files.

Do not create abstractions only to make the architecture appear sophisticated.

The goal is:

> Clean separation without unnecessary complexity.

---

## 2.3 Do Not Overengineer

Use the simplest architecture that correctly supports the current requirements and expected direction.

Do not introduce unnecessary:

* services
* abstractions
* design patterns
* dependencies
* queues
* infrastructure
* distributed-system complexity

However, do not sacrifice meaningful boundaries merely to reduce complexity.

Prefer:

> Simple implementation + strong boundaries.

---

# 3. Default Technology Stack

Unless explicitly changed by the user, use the following stack.

## Monorepo

* Turborepo
* TypeScript

## Frontend

* React
* Vite
* TypeScript
* TanStack React Query
* Zustand when client-side global state is actually required
* Zod
* Tailwind CSS
* shadcn/ui

## Backend

* NestJS
* TypeScript
* tRPC

## Database

* PostgreSQL
* Drizzle ORM

## Optional Infrastructure

Use only when justified by requirements:

* Redis
* WebSockets
* authentication
* authorization
* background workers
* queues
* object storage
* PostGIS
* other infrastructure required by the application

Do not introduce optional infrastructure merely because it exists in the default stack.

---

# 4. Monorepo Architecture

Use a Turborepo monorepo.

Typical structure:

```text
apps/
├── web/
├── api/
├── auth/
├── ...
└── orchestrator/

packages/
├── db/
├── config/
├── types/
├── ui/
└── ...
```

The exact applications depend on the project.

---

# 5. Independent Applications

Every application under `apps/` must be independently understandable and runnable.

For example:

```text
apps/
├── web/
├── api/
├── auth/
└── media/
```

Each application should have its own:

* source code
* configuration
* dependencies where appropriate
* development command
* build command
* test command
* typecheck command
* health check where applicable

An application must not require the orchestrator merely to function normally.

The orchestrator coordinates the applications; it does not make them dependent on itself.

---

# 6. Multi-Agent Architecture

The project uses multiple specialized agents rather than one agent responsible for everything.

The preferred high-level architecture is:

```text
                         SUPERVISOR
                              │
                              ↓
                       ORCHESTRATOR
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
        ARCHITECT          WORKERS          REVIEWERS
             │                │                │
             │       ┌────────┼────────┐       │
             │       ↓        ↓        ↓       │
             │   FRONTEND  BACKEND   DATABASE  │
             │       │        │        │       │
             │       └────────┼────────┘       │
             │                ↓                │
             │           TEST / QA             │
             │                ↓                │
             └────────────→ INTEGRATION ←──────┘
                              │
                              ↓
                          DEPLOYMENT
                              │
                              ↓
                           MONITOR
```

Agents must have clearly defined responsibilities.

Do not allow every agent to modify every part of the project without a reason.

---

# 7. Orchestrator

The orchestrator is the central coordination application.

It is responsible for coordinating the entire development and runtime system.

The orchestrator should be capable of:

* receiving goals
* understanding project state
* decomposing goals into tasks
* assigning tasks to agents
* tracking task state
* managing dependencies
* coordinating parallel work
* detecting failures
* requesting reviews
* triggering tests
* coordinating integration
* coordinating deployment
* monitoring system health
* retrying recoverable failures
* escalating unresolved problems
* updating project knowledge
* determining whether a goal is actually complete

The orchestrator must not contain all business logic.

It coordinates other applications and agents.

---

# 8. Supervisor

The supervisor is above the orchestrator.

Its purpose is to monitor the health of the agent system itself.

The supervisor should detect:

* stuck agents
* repeated failures
* infinite loops
* tasks exceeding expected execution time
* conflicting changes
* services going down
* deployment failures
* agents working outside their assigned scope
* agents repeatedly producing rejected implementations
* broken dependencies
* circular task dependencies

The supervisor may:

```text
restart agent
cancel task
retry task
reassign task
create investigation task
rollback
pause execution
escalate to user
```

The supervisor should prefer recovery over immediate failure when recovery is safe.

---

# 9. Recommended Agent Roles

The initial agent system should remain relatively small.

Recommended roles:

```text
orchestrator
architect
frontend-agent
backend-agent
database-agent
infrastructure-agent
test-agent
review-agent
deployment-agent
```

Additional specialized agents may be introduced when the project requires them.

Do not create an agent merely because a new file or feature exists.

Create a specialized agent when there is a meaningful responsibility boundary.

---

# 10 Frontend Agent Tooling

For frontend development tasks, use Antygravity Google AI as the default frontend implementation tool.

Do not substitute another frontend AI tool unless:

* Antygravity is unavailable,
* the task is outside its capabilities,
* or the user explicitly requests another tool.

# 11. Architect Agent

The architect agent is responsible for:

* understanding system architecture
* designing boundaries
* identifying dependencies
* reviewing proposed architectural changes
* preventing unnecessary coupling
* identifying potential scalability problems
* identifying unnecessary complexity

The architect should generally plan before implementation agents begin.

The architect should not unnecessarily rewrite implementation code.

---

# 12. Implementation Agents

Implementation agents are responsible for executing assigned tasks.

Examples:

```text
frontend-agent
backend-agent
database-agent
infrastructure-agent
```

An implementation agent must:

1. Understand its assigned task.
2. Inspect relevant existing code.
3. Work within its assigned scope.
4. Follow project architecture.
5. Keep responsibilities separated.
6. Run appropriate checks.
7. Report what changed.
8. Report verification results.
9. Report unresolved problems.

An implementation agent must not silently expand the task scope.

If additional work is required, create or request a new task.

---

# 13. Test / QA Agent

The test agent is responsible for verifying behavior.

It should test:

* unit behavior
* integration behavior
* API behavior
* database behavior
* frontend behavior where appropriate
* service communication
* system-level behavior

The test agent should not assume that code is correct because another agent claims it works.

Tests are evidence, not declarations.

---

# 14. Review Agents

Review agents independently inspect completed work.

Possible review responsibilities include:

```text
Code Review
Architecture Review
Testing Review
Security Review
UX Review
```

A reviewer should look for:

* incorrect architecture
* unnecessary complexity
* broken boundaries
* duplicated logic
* missing tests
* type safety problems
* security problems
* incorrect assumptions
* regressions
* violations of project rules

A review failure should become a correction task.

---

# 15. Deployment Agent

The deployment agent is responsible for:

* preparing deployment
* configuring environments
* deploying applications
* checking deployment status
* inspecting logs
* verifying health
* checking inter-service communication
* reporting deployment failures
* rolling back when appropriate

Supported environments may include:

* local development
* WSL
* remote Linux servers
* OpenShift
* other project-approved environments

Deployment is not complete until the deployed system has been verified.

---

# 16. Agent Isolation

Agents must not casually modify the same working tree simultaneously.

Prefer:

```text
main
 │
 ├── task/frontend-login
 ├── task/backend-auth
 ├── task/database-auth
 └── task/tests-auth
```

Each meaningful task should have an isolated branch or equivalent workspace.

Agents should commit meaningful changes to their own branch.

Integration should happen through the orchestrated review and merge process.

---

# 17. Parallel Work

The orchestrator should maximize safe parallelism.

If tasks are independent:

```text
Task A ─────────→ Agent A
Task B ─────────→ Agent B
Task C ─────────→ Agent C
```

they may run concurrently.

If tasks depend on one another:

```text
Task A
  ↓
Task B
  ↓
Task C
```

the dependent task must wait.

The orchestrator must track dependencies explicitly.

Do not run parallel tasks merely because multiple agents are available.

Parallelism is useful only when it is safe.

---

# 18. Task State

Every meaningful task should have an explicit lifecycle.

Recommended states:

```text
BACKLOG
  ↓
PLANNED
  ↓
READY
  ↓
IN_PROGRESS
  ↓
REVIEW
  ↓
TESTING
  ↓
INTEGRATION
  ↓
DEPLOYING
  ↓
VERIFYING
  ↓
COMPLETED
```

Failure states may include:

```text
BLOCKED
FAILED
NEEDS_REVIEW
NEEDS_USER_INPUT
```

The orchestrator must know why a task is in its current state.

---

# 19. Task Ownership

Every task should have:

* unique identifier
* description
* owner agent
* dependencies
* affected applications
* expected outcome
* current status
* verification requirements

Agents should not claim tasks without the orchestrator assigning them.

---

# 20. Agent Communication

Agents should communicate through explicit task state, artifacts, reports, and shared project state.

Do not rely exclusively on conversational context between agents.

Important information should be persisted.

Useful shared state may include:

```text
.orchestrator/
├── tasks/
├── agents/
├── decisions/
├── runs/
├── logs/
├── artifacts/
└── state/
```

A database may be used when persistent or concurrent state requires it.

The exact implementation is project-dependent.

---

# 21. Agent Reports

When an agent finishes a task, it should report:

```text
Task
Changes
Files affected
Tests executed
Build result
Integration result
Known problems
Follow-up tasks
```

Do not report success when verification failed.

---

# 22. Autonomous Development Loop

When operating autonomously, the system should follow:

```text
Goal
 ↓
Orchestrator
 ↓
Plan
 ↓
Create tasks
 ↓
Resolve dependencies
 ↓
Assign agents
 ↓
Parallel implementation
 ↓
Local verification
 ↓
Review
 ↓
Correction
 ↓
Integration
 ↓
System testing
 ↓
Deployment
 ↓
Health verification
 ↓
Monitor
 ↓
Complete
```

If something fails:

```text
Failure
 ↓
Diagnose
 ↓
Create correction task
 ↓
Assign agent
 ↓
Fix
 ↓
Re-test
```

Repeat until:

* the problem is resolved
* the task is blocked
* or human intervention is required.

---

# 23. Failure Recovery

Agents must attempt safe recovery from failures.

Examples:

```text
Build failure
→ inspect logs
→ identify cause
→ fix
→ rebuild

Test failure
→ reproduce
→ diagnose
→ fix
→ rerun

Deployment failure
→ inspect deployment
→ inspect logs
→ correct configuration/code
→ redeploy

Agent failure
→ inspect state
→ retry or reassign
```

Do not endlessly retry the same failure.

Repeated identical failures should trigger investigation or escalation.

---

# 24. Human Escalation

The system should continue autonomously when the decision is safe and reversible.

Ask the user when:

* a major architectural decision is ambiguous
* destructive action is required
* requirements conflict
* credentials or secrets are required but unavailable
* a security-sensitive decision cannot be safely inferred
* repeated automated recovery fails
* the system cannot determine the user's intended behavior
* continuing could cause significant irreversible damage

Do not ask the user questions that can be answered from the project rules.

---

# 25. Autonomy Levels

The project supports different autonomy levels.

## Level 0 — Human Controlled

Agents analyze and propose changes.

Human approval is required for implementation or integration.

## Level 1 — Development Autonomous

Agents may:

* inspect code
* create branches
* implement tasks
* run tests
* fix ordinary failures
* commit changes

Human approval is required for significant integration or deployment.

## Level 2 — Project Autonomous

Agents may additionally:

* merge approved branches
* deploy
* restart services
* create tasks
* spawn agents
* manage development environments
* perform routine infrastructure operations

## Level 3 — Fully Autonomous

The system may:

```text
receive goal
→ plan
→ implement
→ review
→ test
→ deploy
→ monitor
→ repair
→ continue
```

without waiting for the user for routine decisions.

The configured autonomy level must always be respected.

---

# 26. Safety Around Autonomous Operations

Autonomy does not mean unlimited authority.

Agents must be conservative around:

* production data
* destructive database operations
* credentials
* secrets
* infrastructure deletion
* irreversible migrations
* public deployments
* security configuration
* user data

When an operation is destructive or difficult to reverse, escalate unless explicitly authorized by project rules.

---

# 27. System Health

The orchestrator should maintain a system-level view.

A system may contain:

```text
Web
API
Auth
Database
Redis
Workers
Other Services
```

The system is healthy only when the relevant components are functioning and communicating correctly.

Do not declare success because:

```text
API = healthy
```

if:

```text
Web → API
API → Auth
API → Database
```

is broken.

---

# 28. Verification Levels

Verification should occur at multiple levels.

## Application Verification

```text
typecheck
lint
unit tests
build
```

## Integration Verification

```text
Web → API
API → Database
API → Auth
Service → Service
```

## System Verification

Use the orchestrator to verify the complete relevant system.

## Deployment Verification

After deployment:

```text
deployment status
health checks
logs
service communication
critical user flow
```

Only after appropriate verification should the task be marked complete.

---

# 29. Development Workflow

For every meaningful feature:

```text
Read rules
 ↓
Inspect codebase
 ↓
Understand architecture
 ↓
Create plan
 ↓
Create task graph
 ↓
Identify independent tasks
 ↓
Assign agents
 ↓
Create isolated branches/workspaces
 ↓
Implement
 ↓
Typecheck
 ↓
Lint
 ↓
Test
 ↓
Review
 ↓
Correct
 ↓
Integrate
 ↓
Build
 ↓
System verification
 ↓
Deploy when required
 ↓
Deployment verification
 ↓
Update learned rules
 ↓
Complete
```

Do not move to the next meaningful feature while the current feature is known to be broken.

---

# 30. Git Workflow

Git is part of the development system.

For meaningful work:

1. Ensure the repository exists.
2. Inspect the current state.
3. Create a dedicated branch.
4. Implement changes.
5. Test changes.
6. Review changes.
7. Commit.
8. Merge only after verification.
9. Push to the remote repository when appropriate.

Do not perform feature development directly on `main` unless explicitly instructed.

Do not merge known-broken work.

---

# 31. GitHub and Remote Development

New projects should use GitHub by default unless the user specifies otherwise.

The agent should be able to manage the normal Git workflow without waiting for unnecessary confirmation.

When required, the system should support remote execution and deployment through:

* WSL
* remote Linux servers
* OpenShift
* other configured environments

The agent must verify the remote system after deployment.

---

# 32. Self-Learning System

This project contains a continuously evolving rules system.

The agent must learn from:

* explicit user preferences
* user corrections
* architectural decisions
* recurring mistakes
* repeated patterns
* project conventions
* workflow requirements

The purpose is to improve future behavior.

The agent must not blindly record every conversation detail.

---

# 33. Learning From Corrections

When the user says:

* "No, do it this way."
* "I don't want this."
* "Always do X."
* "Never do Y."
* "Don't do this again."
* "Separate these."
* "This belongs somewhere else."

the agent must:

1. Correct the current work.
2. Determine whether the feedback represents a durable preference or rule.
3. If it does, add a learned rule.
4. Apply the rule in future tasks.

---

# 34. Pattern Recognition

Repeated corrections should be analyzed as potential patterns.

For example:

```text
Correction 1:
"Don't put this in the controller."

Correction 2:
"Business logic belongs in services."

Correction 3:
"Why are you putting database logic in the controller?"
```

These may represent one durable architectural rule:

```text
[ARCH] Keep business logic and persistence logic out of controllers.
```

The agent should recognize such patterns.

Do not require the user to explicitly say "remember this" every time a durable pattern becomes obvious.

---

# 35. Rule Creation Threshold

Create a learned rule when there is sufficient evidence that the behavior is durable.

Strong signals:

* explicit "always"
* explicit "never"
* repeated correction
* repeated architectural preference
* repeated workflow preference
* project-wide convention

Weak signals that normally should not create rules:

* one-off debugging
* temporary implementation
* variable naming
* experimental code
* feature-specific decisions
* accidental behavior

Ask:

> Would this likely matter again in future work?

If not, do not create a permanent rule.

---

# 36. Learned Rule Format

Rules must use:

```text
N. `[CATEGORY]` Always/Never do X - because Y.
```

Supported categories:

* `[CODE]`
* `[STYLE]`
* `[ARCH]`
* `[TOOL]`
* `[PROCESS]`
* `[DATA]`
* `[UX]`
* `[DEPLOYMENT]`
* `[TESTING]`
* `[AGENTS]`
* `[OTHER]`

Rules must be:

* concise
* specific
* actionable
* understandable without the original conversation

---

# 37. Rule Precedence

Rules are numbered sequentially.

Newer rules override older rules when they conflict.

Never silently delete an older learned rule.

If a rule becomes obsolete:

1. Keep the old rule.
2. Add a newer rule.
3. Follow the newer rule.

This preserves project evolution.

---

# 38. Architecture Decisions Are Persistent

When the user explicitly chooses an architecture, treat the decision as persistent.

For example:

```text
User:
"Every server must be independent."

Learned rule:
[ARCH] Keep applications independently runnable and deployable; the orchestrator coordinates them but must not make them dependent on it.
```

Do not repeatedly ask the user to make the same architectural decision.

---

# 39. Project Knowledge vs Temporary Context

Do not store temporary conversation state as permanent project rules.

Permanent rules should describe:

```text
How we build
How we organize
How we test
How we deploy
How agents cooperate
How the user prefers work to be done
```

Temporary state should remain in task state or project artifacts.

---

# 40. Before Starting Any Task

Perform this checklist:

```text
[ ] Read CLAUDE.md
[ ] Review relevant learned rules
[ ] Inspect existing code
[ ] Understand architecture
[ ] Identify affected apps
[ ] Identify affected packages
[ ] Identify dependencies
[ ] Determine whether parallel work is safe
[ ] Create or update task plan
[ ] Implement
[ ] Typecheck
[ ] Lint
[ ] Run tests
[ ] Review
[ ] Integrate
[ ] Verify system
[ ] Deploy if required
[ ] Verify deployment
[ ] Check Git state
[ ] Update learned rules if necessary
```

---

# 41. Completion Criteria

Never declare a task complete merely because implementation finished.

A task is complete when:

```text
Implementation
    +
Required tests
    +
Type safety
    +
Build
    +
Review
    +
Integration
    +
System verification
    +
Deployment verification when applicable
```

have passed to the level required by the task.

If something remains unresolved, report it explicitly.

---

# 42. Current Learned Rules

<!-- New rules are appended below this line. Do not edit above this section. -->

1. `[PROCESS]` Always initialize a git repo and push new projects to GitHub by default, without waiting to be asked - user preference stated 2026-08-17.

2. `[PROCESS]` Always create a new branch when starting new work/features, and only merge to `main` after testing - user preference stated 2026-08-17.

3. `[TOOL]` Always run/test the app via a local HTTP server during local development, never by opening application files directly with `file://` URLs - user preference stated 2026-08-17.

4. `[ARCH]` When cross-device access is required, provide access through a real public host rather than a LAN-bound local server; local servers remain appropriate for the development loop before deployment - user preference stated 2026-08-17.

5. `[DATA]` The home page of the English-learning application is a landing page for Hodaya Jerby, an English teacher with five years of experience teaching children and a degree in English teaching; do not invent or embellish credentials without checking first - user-provided information stated 2026-08-17.

6. `[UX]` The English-learning application's primary UI language is Hebrew and its layout uses RTL direction; English vocabulary words and example sentences remain in English - user preference stated 2026-08-17.

7. `[DATA]` Each vocabulary word uses a `translation` field containing a direct Hebrew word or phrase translation rather than a descriptive sentence; the field is used for flashcards, quiz answers, and scramble hints - user preference stated 2026-08-17.

8. `[ARCH]` Build applications as independently runnable applications inside the monorepo; the orchestrator must coordinate and verify them without making them dependent on the orchestrator for normal operation - user architectural decision stated 2026-08-17.

9. `[ARCH]` Use a Turborepo monorepo with independent applications under `apps/` and shared code under `packages/` unless the user explicitly chooses a different structure - user architectural decision stated 2026-08-17.

10. `[ARCH]` Use React, Vite, TypeScript, TanStack Query, Zod, Zustand when needed, Tailwind CSS, shadcn/ui, NestJS, tRPC, PostgreSQL, and Drizzle as the default application stack unless the project requirements or user explicitly require otherwise - user preference stated 2026-08-17.

11. `[ARCH]` Prefer clean separation of responsibilities without overengineering; separate focused responsibilities into appropriate files and modules while avoiding speculative abstractions - user architectural preference stated 2026-08-17.

12. `[PROCESS]` Before moving to the next meaningful feature, verify the current feature through the appropriate typecheck, lint, tests, build, integration, and system checks - user workflow preference stated 2026-08-17.

13. `[PROCESS]` Recognize repeated user corrections as potential project-wide patterns and convert sufficiently repeated patterns into learned rules instead of treating every correction as an isolated event - user workflow preference stated 2026-08-17.

14. `[PROCESS]` The agent is expected to perform the complete development workflow, including Git operations and deployment/verification in appropriate remote environments such as WSL, OpenShift, or remote servers when required by the project - user workflow preference stated 2026-08-17.

15. `[AGENTS]` Use multiple specialized agents coordinated by a central orchestrator rather than relying on one agent for the entire project - user preference stated 2026-08-17.

16. `[AGENTS]` Keep implementation agents independently scoped and prevent unnecessary simultaneous modification of the same working tree; use isolated branches or workspaces for parallel work - user preference stated 2026-08-17.

17. `[AGENTS]` Use an orchestrator to decompose goals into tasks, assign agents, track dependencies, coordinate reviews, integrate work, and verify system-level completion - user architectural decision stated 2026-08-17.

18. `[AGENTS]` Use a supervisor layer to monitor agents and the orchestrator, recover from failures when safe, and escalate repeated or unsafe failures - user preference stated 2026-08-17.

19. `[AGENTS]` Recognize that independent tasks may run in parallel, but dependent tasks must wait for their prerequisites; maximize safe parallelism rather than unrestricted parallel execution - user preference stated 2026-08-17.

20. `[AGENTS]` Require implementation work to pass appropriate review and verification before integration and completion; an agent's claim that its task is finished is not sufficient evidence of correctness - user preference stated 2026-08-17.

21. `[AGENTS]` Support autonomous operation when the user is unavailable, while respecting configured autonomy levels and escalating ambiguous, destructive, security-sensitive, or repeatedly failing decisions to the user - user preference stated 2026-08-17.

22. `[PROCESS]` Always open and verify the deployed live site after finishing work; do not rely on localhost or a successful git push as proof of deployment. Verify that the deployment corresponds to the latest `main` commit by checking the GitHub Pages deployment workflow and, when useful, validating a distinctive string from the latest change against the live URL. If the Pages deployment fails or gets stuck, diagnose the deployment workflow and retrigger it when appropriate.

23. `[TOOL]` Always use Antygravity Google AI for frontend tasks unless the user explicitly instructs otherwise.
