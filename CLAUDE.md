# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a NestJS backend application for a quiz/question management system with multi-language support (Uzbek, Karakalpak, Russian). The app provides REST APIs for managing questions and file uploads, integrated with PostgreSQL via TypeORM.

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

### Core Structure

**Main Application Setup (src/main.ts)**
- Server runs on port 3001
- CORS enabled for all origins
- Swagger UI available at `/api/docs`
- Static file serving configured for uploads directory

**Database Configuration (src/data-source.ts)**
- PostgreSQL database connection via TypeORM
- Environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Default fallbacks: localhost:5432, user: postgres, password: 1234, database: nestjs_db
- `synchronize: true` is enabled (only suitable for development)
- SQL logging enabled for debugging

### Entity Relationships

**Question Entity**
- Primary table: `questions`
- Has one-to-many relationship with `answers`
- Fields: id, question (text), options (text array), correct_option, image_path, lang (enum)
- Language support via `LangEnum`: uz (Uzbek), kr (Karakalpak), ru (Russian)
- Cascade delete enabled on answers

**Answer Entity**
- Primary table: `answers`
- Many-to-one relationship with `questions`
- Fields: id, letter, value, correct (boolean)
- Automatically deleted when parent question is deleted

### Module Organization

**Question Module** (`src/question/`)
- CRUD operations for questions
- Pagination support (50 items per page)
- Random question retrieval filtered by language
- Bulk creation endpoint
- Partial update support (correct_option, image_path)
- JSON import functionality from `src/data/questions.json`

**Upload Module** (`src/upload/`)
- File upload functionality using Multer
- Configuration in `src/multer.config.ts`
- Files stored in `uploads/` directory
- Static file serving configured at `/uploads` route

## API Endpoints

### Questions API (`/questions`)
- `POST /questions` - Create single question
- `POST /questions/bulk` - Create multiple questions
- `GET /questions?page=1&lang=uz` - Get paginated questions (optional language filter)
- `GET /questions/random?lang=uz` - Get 50 random questions by language
- `GET /questions/:id` - Get single question with answers
- `PATCH /questions/:id` - Update question
- `PATCH /questions/:id/correct-option` - Update only correct option
- `PATCH /questions/:id/image-path` - Update only image path
- `DELETE /questions/:id` - Delete question
- `POST /questions/import` - Import questions from JSON file

### Upload API (`/upload`)
- `POST /upload/file` - Upload file (multipart/form-data)

## Important Notes

- The application uses environment variables from `.env` file (dotenv package)
- Image paths are stored relative to the uploads directory
- Questions can have optional images
- All Swagger documentation is auto-generated from decorators
- The codebase contains Uzbek language comments (e.g., "Savollar bazaga saqlandi" = "Questions saved to database")
