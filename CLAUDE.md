# Self-Correcting Rules Engine

Read this entire file before starting any task.

## Overview

This file contains a growing ruleset that improves agent performance over time.

> **Important:** At session start, read the entire "Learned Rules" section before doing anything.

---

## How It Works

1. **Auto-Append on Correction:** When the user corrects you or you make a mistake, immediately append a new rule to the `Learned Rules` section at the bottom of this file.
2. **Sequential Numbering:** Rules are numbered sequentially and written as clear, imperative instructions.
3. **Format Standard:**
   `N. [CATEGORY] Always/Never do X - because Y.`
4. **Supported Categories:**
   - `[CODE]`
   - `[STYLE]`
   - `[ARCH]`
   - `[TOOL]`
   - `[PROCESS]`
   - `[DATA]`
   - `[UX]`
   - `[OTHER]`
5. **Pre-Task Scan:** Before starting any task, scan all rules below for relevant constraints.
6. **Conflict Resolution:** If two rules conflict, the higher-numbered (newer) rule wins.
7. **Rule Immutability:** Never delete rules. If a rule becomes obsolete, append a new rule that supersedes it.

---

## When to Add a Rule

- User explicitly corrects your output (*"no, do it this way"*).
- User rejects a file, approach, or pattern.
- You hit a bug caused by a wrong assumption about this codebase.
- User states a preference (*"always use X"*, *"never do Y"*).

---

## Rule Format Examples

 1. `[CODE]` Always use `bun` instead of `npm` - user preference, bun is installed globally.
 2. `[STYLE]` Never add emojis to commit messages - user preference.
 3. `[ARCH]` API routes live in `src/server/routes/`, not `src/api/` - project convention, existing codebase pattern.

---

## Learned Rules

<!-- New rules are appended below this line. Do not edit above this section. -->

1. `[PROCESS]` Always initialize a git repo and push new projects to GitHub by default, without waiting to be asked - user preference stated 2026-08-17.
2. `[PROCESS]` Always create a new branch when starting new work/features, and only merge to `main` after testing - user preference stated 2026-08-17.
3. `[TOOL]` Always run/test this app via a local HTTP server (see `serve.ps1`), never by opening files with `file://` URLs - user preference stated 2026-08-17.
4. `[ARCH]` Always give the user remote access from other devices via a real public host (GitHub Pages, <https://meirgerby.github.io/learn-english-app/>, enabled on `main`), not a LAN-bound local server - user preference stated 2026-08-17. Supersedes rule 3 for cross-device access; rule 3's local server is still used for dev-loop testing before pushing.
5. `[DATA]` The home page (`index.html`) is a landing page for Hodaya Jerby, an English teacher - 5 years teaching children, degree in English teaching - not a plain game menu. Bio content came directly from the user (2026-08-17); don't invent or embellish credentials for her without checking first.
6. `[STYLE]` The app's UI language is Hebrew with `dir="rtl"` layout, since it targets Hebrew-speaking English learners - decided 2026-08-17. English vocabulary words and example sentences (the learning content) stay in English; word "definitions" are their Hebrew meanings. `CATEGORY_LABELS` in `data.js` holds the Hebrew category names.
