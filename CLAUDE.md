# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS backend for a driver's license quiz system with multi-language support (Uzbek `uz`, Karakalpak `kr`, Russian `ru`). PostgreSQL via TypeORM. Swagger UI at `/api/docs`.

## Commands

```bash
npm run start:dev      # Development with watch mode
npm run build          # Compile TypeScript
npm run start:prod     # Run compiled build
npm run pkg:build      # Package as Windows .exe (node18-win-x64) via pkg
npm run test           # Jest unit tests
npm run lint           # ESLint with auto-fix
```

Run a single test file: `npx jest src/question/question.service.spec.ts`

Create initial admin: `npx ts-node src/scripts/create-admin.ts` (credentials: `admin` / `admin123`)

## Environment Setup

Copy `.env.example` to `.env`. Required variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`.

Default fallbacks in `src/data-source.ts`: `localhost:5432`, user `postgres`, password `1234`, database `yangi`.

## Architecture

### Key Architectural Decisions

**Database**: `synchronize: false` — schema changes require manual migrations in `src/migrations/`. Run via TypeORM CLI against the compiled `dist/migrations/*.js` files. The `AppDataSource` initializes itself at module load time (top-level `.initialize()` call in `data-source.ts`).

**Authentication flow**: Two-layer guard system. `JwtAuthGuard` (extends `AuthGuard('jwt')`) verifies the Bearer token; `RolesGuard` checks the `@Roles()` decorator metadata against `req.user.role`. Apply both guards together on admin-only controllers.

**Random question selection** (`QuestionService.getRandomQuestions`): Fetches only IDs first, shuffles in-memory with JS, then fetches full data for the selected subset — avoids `ORDER BY RANDOM()` on a large table.

**Static files**: `@nestjs/serve-static` mounts the `uploads/` directory at `/uploads`. Path resolved relative to `process.cwd()`, not `__dirname`.

**Question import**: `importQuestionsFromJson` upserts by ID — existing questions are updated, new ones inserted. Categories and templates are created on-demand with `ON CONFLICT DO NOTHING`. Import data files expected at `src/data/lotin.json`, `src/data/rus.json`, `src/data/crill.json`.

**Test result detail**: `user_results.answers_detail` is a JSON column storing per-question answer tracking objects (`{ question_id, selected_option, correct_option, is_correct }`). Analytics and wrong-question features parse this in application code.

### Module Map

| Module | Path | Notes |
|--------|------|-------|
| Question | `src/question/` | Core CRUD + import + random fetch |
| Category | `src/category/` | Read-only; returns `status = 1` only |
| Auth | `src/auth/` | JWT + local Passport strategies |
| User | `src/user/` | Admin-only CRUD; bcryptjs hashing |
| Result | `src/result/` | Test submission + user statistics |
| Analytics | `src/analytics/` | Admin-only; aggregates `answers_detail` |
| Upload | `src/upload/` | Multer file uploads → `uploads/` dir |

### Entity Relationships

```
categories ──< questions >── question_templates ──< templates
                   │
                   └──< answers (cascade delete)

users ──< user_results
```

`Question` has `lang` (LangEnum: `uz`/`kr`/`ru`), `category_id`, `type`, `static_order_answers`, `is_new`, `status`.

`UserResult` belongs to `User`; `answers_detail` is a JSON array.

### CORS & Server

Port `3003`, bound to `0.0.0.0`. Allowed origins: `https://doc.mironshokh.uz`, `https://api.mironshokh.uz`, `http://localhost:3000`, `http://localhost:5173`, `http://localhost:3001`. Add new client origins in `src/main.ts`.

## Codebase Notes

- Console messages and some comments are in Uzbek — this is intentional.
- `multer.config.ts` sets timestamp-based unique filenames for uploads.
- The cleanup endpoint (`DELETE /questions/cleanup`) runs raw `TRUNCATE ... CASCADE` — it wipes questions, answers, categories, templates, and the junction table entirely.
- `getAllQuestions` accepts optional `search` query param (ILIKE full-text on question text) not shown in older docs.
- `getQuestionsByCategory` is a separate service method exposed via the questions controller.
