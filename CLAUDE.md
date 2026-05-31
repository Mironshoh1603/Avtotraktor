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
- `npm run pkg:build` - Build and package as standalone executable using pkg

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

### Setup Commands
- Create `.env` file based on `.env.example`
- Run `npx ts-node src/scripts/create-admin.ts` to create initial admin user (username: admin, password: admin123)

## Architecture

### Main Application Setup (src/main.ts)
- Server runs on port 3003
- CORS enabled for specific origins: `doc.mironshokh.uz`, `api.mironshokh.uz`, `localhost:3000`, `localhost:5173`, `localhost:3001`
- Swagger UI available at `/api/docs` with production server at `api.mironshokh.uz`
- Static file serving configured for uploads directory at `/uploads`

### Database Configuration (src/data-source.ts)
- PostgreSQL database connection via TypeORM
- Environment variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Default fallbacks: localhost:5432, user: postgres, password: 1234, database: autotraktor
- `synchronize: true` is enabled (only suitable for development)
- SQL logging disabled for production

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

**User Entity** (`src/entities/user.entity.ts`)
- Primary table: `users`
- Fields: id, username, password, role, status, created_at, updated_at
- User roles: `admin` (can create users) and `user` (regular test taker)
- Password is hashed using bcryptjs
- One-to-many relationship with `user_results`

**UserResult Entity** (`src/entities/user-result.entity.ts`)
- Primary table: `user_results`
- Fields: id, user_id, total_questions, correct_answers, wrong_answers, score_percentage, answers_detail, test_language, test_duration_seconds, completed_at
- Stores detailed test results for each user
- Many-to-one relationship with `users`
- Automatically calculates score percentage
- Stores detailed answer information in JSON format

### Module Organization

**Question Module** (`src/question/`)
- CRUD operations for questions
- Pagination support (50 items per page)
- Random question retrieval filtered by language (configurable limit, default 50)
- Bulk creation endpoint
- Partial update support (correct_option, image_path, or full update)
- JSON import functionality from files in `src/data/` directory
- Import process handles categories and templates automatically

**Category Module** (`src/category/`)
- Read-only operations for categories
- Returns only active categories (status = 1)
- Simple CRUD service with repository pattern

**Auth Module** (`src/auth/`)
- JWT-based authentication system
- Local strategy for username/password login
- JWT strategy for protected routes
- Password hashing with bcryptjs
- Login endpoint with token generation

**User Module** (`src/user/`)
- Admin-only user management
- CRUD operations for user accounts
- User status toggle functionality
- Role-based access control
- Password validation and hashing

**Result Module** (`src/result/`)
- Test result management and storage
- User-specific result access control
- Statistical analysis of test performance
- Admin access to all user results
- Detailed answer tracking and analysis

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

### Categories API (`/categories`)
- `GET /categories` - Get all active categories (status = 1)

### Authentication API (`/auth`)
- `POST /auth/login` - User login with username and password (returns JWT token)

### Users API (`/users`) - **Admin Only**
- `POST /users` - Create new user (Admin only)
- `GET /users` - Get all users (Admin only)
- `GET /users/:id` - Get user by ID (Admin only)
- `PATCH /users/:id` - Update user (Admin only)
- `PATCH /users/:id/toggle-status` - Toggle user active/inactive status (Admin only)
- `DELETE /users/:id` - Delete user (Admin only)

### Test Results API (`/results`)
- `POST /results` - Submit test result (authenticated users)
- `GET /results/my-results` - Get current user's test results
- `GET /results/my-statistics` - Get current user's test statistics
- `GET /results/:id` - Get specific test result (own results only, unless admin)
- `GET /results/user/:userId` - Get user's test results (Admin only)
- `GET /results/user/:userId/statistics` - Get user's statistics (Admin only)
- `GET /results/all?page=1&limit=50` - Get all test results with pagination (Admin only)

### Analytics API (`/analytics`) - **Admin Only**
- `GET /analytics/wrong-questions?limit=20` - Get most wrong answered questions
- `GET /analytics/general` - Get general platform statistics
- `GET /analytics/categories?categoryId=1` - Get category-wise analytics

### Upload API (`/upload`)
- `POST /upload/file` - Upload file (multipart/form-data)

## Important Notes

### Environment Configuration
- The application uses environment variables from `.env` file (dotenv package)
- Required variables: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`, `JWT_SECRET`
- Copy `.env.example` to `.env` and configure your database and JWT secret

### Authentication System
- JWT-based authentication with configurable secret key
- Two user roles: `admin` (can manage users) and `user` (can take tests)
- All protected endpoints require `Authorization: Bearer <token>` header
- Admin user must be created using the setup script: `npx ts-node src/scripts/create-admin.ts`
- Default admin credentials: username: `admin`, password: `admin123`

### Test Result Tracking
- All user test results are automatically saved to the database
- Users can only view their own results and statistics
- Admins can view all users' results and statistics
- Results include detailed answer tracking, score percentage, and test duration
- Statistical analysis includes total tests, average score, highest/lowest scores

### Data Management
- Image paths are stored relative to the uploads directory
- Questions can have optional images, answer videos, and descriptions
- All Swagger documentation is auto-generated from decorators
- The codebase contains Uzbek language comments and console messages
- Question import functionality creates categories and templates if they don't exist
- Import endpoints use hardcoded paths in `src/data/` directory (lotin.json, rus.json, crill.json)
- The cleanup endpoint uses `TRUNCATE TABLE` with `CASCADE` to remove all data from questions, answers, categories, templates, and junction tables
- Import process handles duplicate IDs by updating existing questions rather than creating new ones

## Admin Panel

### React Admin Dashboard
- Location: `admin-panel/` directory
- Built with React + TypeScript + Vite + Tailwind CSS
- Authentication required (admin role only)

### Setup Admin Panel
1. Navigate to admin panel: `cd admin-panel`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access at: `http://localhost:5173`

### Admin Panel Features
- **Dashboard**: Overview statistics and platform metrics
- **User Management**: Create, edit, delete users with role management
- **Analytics**: Platform-wide statistics and category performance
- **Error Analysis**: Most wrong answered questions with detailed breakdown
- **Authentication**: JWT-based login system with session management

### Admin Panel Pages
- `/login` - Admin authentication
- `/dashboard` - General overview and statistics
- `/users` - User management interface
- `/analytics` - Platform analytics and insights  
- `/errors` - Error analysis and problematic questions

### Default Admin Access
- Username: `admin`
- Password: `admin123`
- Create with: `npx ts-node src/scripts/create-admin.ts`
