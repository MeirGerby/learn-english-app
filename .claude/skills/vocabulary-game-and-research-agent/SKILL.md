---
name: vocabulary-game-and-research-agent
description: Spec for two NOT-YET-BUILT features - a generic reusable vocabulary-game engine (data/logic/UI separated, consuming the full word bank, extensible to future mechanics like matching/spelling/listening) and an autonomous product-research agent that proposes (never silently implements) new game ideas behind an approval gate. Load this only when actually building either of those two specific features; not needed for day-to-day work on the 5 games that already exist.
---

*(Added verbatim by the user on 2026-08-18 as part of a much larger CLAUDE.md paste. Moved here 2026-08-18 to keep CLAUDE.md's always-loaded context small - see CLAUDE.md's Learned Rules for why. TypeScript policy note: the mandatory-TypeScript section below predates the full React/TS migration completed the same day; the migration already satisfies it project-wide, so treat that subsection as "already done" rather than a live directive.)*

## 43.1 Mandatory TypeScript Policy

TypeScript is mandatory throughout the project.

### Rules

* All application source code must be written in TypeScript.
* React components must use `.tsx`.
* TypeScript modules must use `.ts`.
* Do not introduce new JavaScript source files.
* Do not implement new features in `.js` or `.jsx`.
* Prefer strict TypeScript typing over `any`.
* Do not use `any` unless there is a documented technical reason.
* Reuse existing types instead of duplicating type definitions.
* Keep shared types centralized when they are used by multiple parts of the application.
* New APIs, services, game engines, utilities, hooks, and components must all be implemented in TypeScript.
* Configuration files should use TypeScript whenever the relevant tool supports TypeScript configuration.
* Before considering a feature complete, verify that TypeScript compilation succeeds.

### TypeScript Quality Gate

Every implementation must satisfy:

1. No unnecessary `any`.
2. No unnecessary `@ts-ignore`.
3. No unnecessary type assertions.
4. No duplicated domain types.
5. No JavaScript implementation when TypeScript can be used.
6. TypeScript checks must pass before the task is considered complete.

---

## 43.2 Vocabulary Game

Add a new vocabulary game to the Learn English App.

### Goal

Create a game that helps learners actively learn, recognize, recall, and practice the complete vocabulary defined in the provided Foundation Lexis document.

The provided document contains the Foundation-level core vocabulary, including words such as:

* action
* address
* afraid
* afternoon
* agree
* animal
* answer
* arrive
* beautiful
* believe
* birthday
* breakfast
* brother
* classroom
* computer
* country
* dictionary
* difficult
* family
* favorite
* friend
* garden
* happy
* important
* interesting
* lesson
* message
* money
* morning
* question
* remember
* school
* sentence
* student
* understand
* vacation
* vocabulary-related everyday words
* and the rest of the vocabulary contained in the source document.

Do NOT manually select only a small subset of these words.

The game must be designed so that the vocabulary dataset can contain the complete source vocabulary and can grow without requiring changes to the game engine.

### Vocabulary Data Architecture

Separate vocabulary data from game logic.

Do not hard-code vocabulary directly inside React components.

Create a typed vocabulary model.

Each vocabulary item should support, where applicable:

* word
* part of speech
* definition
* example sentence
* difficulty/level
* category
* optional translation
* optional image
* optional pronunciation/audio
* optional metadata

The exact fields should follow the existing architecture of the application.

The vocabulary dataset must be reusable by multiple games in the future.

### Game Architecture

Build the game as a reusable game feature rather than a one-off page.

Separate:

* vocabulary data
* game logic
* scoring
* progress tracking
* question generation
* UI
* game state
* persistence

The game should support:

* random vocabulary selection
* repeated practice
* scoring
* correct/incorrect feedback
* progress tracking
* different difficulty levels
* replaying previously learned words
* prioritizing words the learner struggles with

Avoid creating a separate implementation for every vocabulary word.

The game engine should operate on the vocabulary dataset.

### Future Extensibility

Design the vocabulary system so additional games can reuse the same dataset.

Future games should be able to consume the same vocabulary through a shared typed interface.

Examples of future game mechanics:

* word matching
* multiple choice
* word-to-definition
* definition-to-word
* spelling
* sentence completion
* listening
* image recognition
* memory cards
* timed challenges

Do not implement all of these automatically unless they are part of an approved task.

---

## 43.3 English Learning Product Research Agent

Create a new autonomous agent whose responsibility is continuous product research for the Learn English App.

Name:

`english-learning-product-research-agent`

### Mission

The agent researches existing English-learning games, educational websites, language-learning products, and successful learning mechanics.

Its goal is to discover:

* new game ideas
* vocabulary-learning mechanics
* English-learning exercises
* retention mechanics
* progression systems
* difficulty systems
* reward systems
* practice methods
* UX patterns
* educational techniques
* features that could improve the Learn English App

The agent should focus on ideas that are realistically implementable in the existing application.

### Research Sources

The agent may research:

* English-learning websites
* language-learning applications
* educational games
* vocabulary games
* spelling games
* grammar games
* listening games
* reading games
* pronunciation-learning products
* educational UX patterns
* publicly available product information

Do not blindly copy another product.

Extract the underlying learning mechanic and determine how it could be adapted into the Learn English App.

---

## 43.4 Research Agent Output

The research agent must NOT directly implement a new feature merely because it discovered an interesting idea.

Instead, it creates a structured recommendation.

Every recommendation must contain:

#### Feature

A clear name for the proposed feature or game.

#### Problem

What learner problem does this solve?

#### Idea

What is the proposed experience?

#### Learning Value

Why would this help someone learn English?

#### Evidence

Where did the idea come from?

Include the relevant source/product and explain the observed mechanic.

#### Adaptation

Explain how the mechanic could be adapted specifically for Learn English App.

#### UX Flow

Describe how a learner would use it.

#### Technical Impact

Identify:

* frontend changes
* backend changes
* database changes
* shared types
* APIs
* new dependencies, if any

#### Complexity

Estimate:

* Small
* Medium
* Large

#### Priority

Recommend:

* High
* Medium
* Low

#### Recommendation

Give a clear recommendation:

`RECOMMENDED`
or
`NOT RECOMMENDED`

Explain why.

---

## 43.5 Approval Gate

The research agent must never silently turn research into implementation.

The workflow is:

```text
Research
   ↓
Analyze
   ↓
Create Recommendation
   ↓
User Approval
   ↓
Implementation Agent
   ↓
Tests
   ↓
Review
   ↓
Complete
```

The user should only need to approve or reject the recommendation.

Examples:

```text
APPROVED: Build the vocabulary matching game.
```

or:

```text
REJECTED
```

or:

```text
APPROVED: Build recommendations 1 and 3.
```

Once approved, Claude should take responsibility for the remaining implementation workflow.

---

## 43.6 Autonomous Implementation After Approval

After the user approves a recommendation, do not repeatedly ask the user for implementation details that can be determined from the existing project.

The implementation workflow should be:

1. Understand the existing architecture.
2. Inspect relevant existing code.
3. Create an implementation plan.
4. Implement the feature.
5. Reuse existing components and infrastructure where appropriate.
6. Add or update types.
7. Add tests.
8. Run TypeScript checks.
9. Run relevant tests.
10. Run linting/formatting when configured.
11. Review the implementation.
12. Fix discovered issues.
13. Report what was implemented.

Only ask the user when a genuine product decision cannot reasonably be inferred from the project requirements.

---

## 43.7 Agent Coordination

The English Learning Product Research Agent is a research/recommendation agent.

It should work together with the existing development agents.

Recommended flow:

```text
                    ┌──────────────────────────────┐
                    │ English Learning Research    │
                    │ Agent                        │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                         Feature Recommendation
                                   │
                                   ▼
                              USER APPROVAL
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ Planning / Development Agent │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                            Implementation
                                   │
                                   ▼
                              Testing Agent
                                   │
                                   ▼
                             Review Agent
                                   │
                                   ▼
                              Final Result
```

The research agent must not bypass the approval gate.

---

## 43.8 Continuous Product Improvement

The Learn English App should be treated as an evolving product.

The system should periodically identify opportunities to improve:

* learning effectiveness
* engagement
* vocabulary retention
* progression
* difficulty balancing
* game variety
* accessibility
* UX
* performance

Research should result in actionable recommendations rather than generic suggestions.

Avoid recommendations such as:

> "Add more games."

Instead produce concrete proposals such as:

> "Add a timed word-to-definition matching game using spaced repetition so incorrectly answered words appear more frequently."

---

## 43.9 Do Not Overengineer

Before implementing a new feature:

* inspect existing code
* reuse existing components
* reuse existing hooks
* reuse existing services
* reuse existing types
* reuse existing game infrastructure
* avoid unnecessary dependencies
* avoid unnecessary abstractions
* avoid duplicate systems

The simplest architecture that correctly solves the problem is preferred.

---

## 43.10 Definition of Done

A feature is not complete merely because the UI exists.

A feature is complete only when:

* TypeScript passes.
* Relevant tests pass.
* Existing functionality still works.
* The feature follows the existing architecture.
* No unnecessary JavaScript was introduced.
* Types are correctly defined.
* No unnecessary `any` was introduced.
* The implementation has been reviewed.
* Obvious bugs have been fixed.
* The feature is integrated into the actual application flow.
* The user can actually use the feature.

For the Vocabulary Game specifically:

* The complete source vocabulary can be represented.
* Vocabulary data is separated from game logic.
* The game does not hard-code individual words into UI components.
* Progress/scoring works.
* Incorrect answers can be handled.
* The architecture allows future vocabulary games to reuse the same dataset.

