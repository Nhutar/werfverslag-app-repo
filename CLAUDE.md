# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**werfverslag-app** — a Dutch-language application (werfverslag = construction site report). Early-stage; src/ and tests/ are currently empty.

## Commands

Once `package.json` exists (Node.js 20):

```bash
npm ci           # install dependencies
npm run build    # build the project
npm test         # run tests
```

CI runs `npm ci` then `npm run build` on every push to `main` and on all pull requests (`.github/workflows/tests.yml`).

## Changelog

`CHANGELOG.md` follows Semantic Versioning:
- **MAJOR** — breaking changes
- **MINOR** — new features
- **PATCH** — bug fixes, refactoring, tests

Entries are written in Dutch.

## Repository Layout

```
src/          # application source code
tests/        # test files
specs/        # specifications (specs/drafts/ for drafts)
handoffs/     # handoff documentation
```
