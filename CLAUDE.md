# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS backend application for a quiz/question management system with multi-language support (Uzbek, Karakalpak, Russian). The app provides REST APIs for managing questions, categories, templates, and file uploads, integrated with PostgreSQL via TypeORM.

## Development Commands

### Running the Application
- `npm run start:dev` - Start in watch mode for development (recommended)
- `npm run start` - Start without watch mode
- `npm run start:prod` - Run production build (requires `npm run build` first)
- `npm run build` - Build the application for production

### Testing
- `npm run test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

### Code Quality
- `npm run lint` - Run ESLint and auto-fix issues
- `npm run format` - Format code with Prettier

### Database
- `npm run typeorm` - Run TypeORM CLI commands
- Database connection configuration is in `src/data-source.ts`
- Migrations are located in `src/migrations/`

## Architecture

### Main Application Setup (src/main.ts)
- Server runs on port 3001
- CORS enabled for all origins
- Swagger UI available at `/api/docs`
- Static file serving configured for uploads directory at `/uploads`

### Database Configuration (src/data-source.ts)
- PostgreSQL database connection via TypeORM
- Environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Default fallbacks: localhost:5432, user: postgres, password: 1234, database: new
- `synchronize: true` is enabled (only suitable for development)
- SQL logging enabled for debugging

### Entity Relationships

**Question Entity** (`src/entities/question.entity.ts`)
- Primary table: `questions`
- Fields: id, question, options (text array), correct_option, image_path, lang, category_id, type, answer_description, answer_video, comment, static_order_answers, is_new, status
- Language support via `LangEnum`: uz (Uzbek), kr (Karakalpak), ru (Russian)
- Relationships:
  - One-to-many with `answers` (cascade delete enabled)
  - Many-to-one with `categories`
  - Many-to-many with `templates` (via junction table `question_templates`)

**Answer Entity** (`src/entities/answer.entity.ts`)
- Primary table: `answers`
- Fields: id, letter, value, correct (boolean)
- Many-to-one relationship with `questions`
- Automatically deleted when parent question is deleted (cascade)

**Category Entity** (`src/entities/category.entity.ts`)
- Primary table: `categories`
- Fields: id, name, description, status
- One-to-many relationship with `questions`

**Template Entity** (`src/entities/template.entity.ts`)
- Primary table: `templates`
- Fields: id, name, status, questions_count, created_at, updated_at
- Many-to-many relationship with `questions`
- Used to organize questions into test templates

### Module Organization

**Question Module** (`src/question/`)
- CRUD operations for questions
- Pagination support (50 items per page)
- Random question retrieval filtered by language (configurable limit, default 50)
- Bulk creation endpoint
- Partial update support (correct_option, image_path, or full update)
- JSON import functionality from files in `src/data/` directory
- Import process handles categories and templates automatically

**Upload Module** (`src/upload/`)
- File upload functionality using Multer
- Configuration in `src/multer.config.ts`
- Files stored in `uploads/` directory with unique timestamp-based filenames
- Static file serving configured at `/uploads` route

## API Endpoints

### Questions API (`/questions`)
- `POST /questions` - Create single question
- `POST /questions/bulk` - Create multiple questions
- `GET /questions?page=1&lang=uz` - Get paginated questions (optional language filter)
- `GET /questions/random?lang=uz&limit=20` - Get random questions by language (default limit: 50)
- `GET /questions/:id` - Get single question with answers
- `PATCH /questions/:id` - Update question
- `PATCH /questions/:id/correct-option` - Update only correct option
- `PATCH /questions/:id/image-path` - Update only image path
- `DELETE /questions/:id` - Delete question
- `POST /questions/import/lotin` - Import questions from `src/data/lotin.json`
- `POST /questions/import/rus` - Import questions from `src/data/rus.json`
- `POST /questions/import/crill` - Import questions from `src/data/crill.json`
- `POST /questions/import/all` - Import questions from all JSON files
- `DELETE /questions/cleanup` - Clean all questions and related data (truncates all tables)

### Upload API (`/upload`)
- `POST /upload/file` - Upload file (multipart/form-data)

## Important Notes

- The application uses environment variables from `.env` file (dotenv package)
- Image paths are stored relative to the uploads directory
- Questions can have optional images, answer videos, and descriptions
- All Swagger documentation is auto-generated from decorators
- The codebase contains Uzbek language comments and console messages
- Question import functionality creates categories and templates if they don't exist
- Import endpoints use hardcoded paths in `src/data/` directory (lotin.json, rus.json, crill.json)
- The cleanup endpoint uses `TRUNCATE TABLE` with `CASCADE` to remove all data from questions, answers, categories, templates, and junction tables
- Import process handles duplicate IDs by updating existing questions rather than creating new ones
