# AgentVerse - Intelligent Learning Assistant

## Overview

AgentVerse is a full-stack web application that serves as an intelligent learning assistant for students. The platform enables users to search for any topic and receive AI-generated educational content including explanations, examples, and interactive quizzes. The application uses OpenAI's GPT-4 to dynamically generate comprehensive learning materials and tracks user progress across different topics and subtopics.

**Core Features:**
- Topic search with AI-generated subtopics
- Educational content generation (explanations, examples, quizzes)
- Interactive quiz system with instant feedback
- User progress tracking and visualization
- Profile dashboard with learning analytics

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework:** React with TypeScript, using Vite as the build tool and development server.

**Routing:** Wouter for client-side routing, chosen for its lightweight footprint compared to React Router.

**State Management:** TanStack Query (React Query) for server state management, providing caching, background updates, and optimistic updates for API interactions.

**UI Component System:** Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. This approach provides:
- Accessible, unstyled component primitives from Radix UI
- Customizable components copied into the project (not installed as dependencies)
- Consistent design system using CSS variables for theming
- "New York" style variant as specified in components.json

**Styling Strategy:** Tailwind CSS with a custom design system emphasizing educational engagement:
- Dark theme with deep charcoal background (#1E1E2E)
- Bright green (#4ADE80) for CTAs and success states
- Soft purple (#A78BFA) for highlights and progress indicators
- Custom spacing, typography, and component variants

**Type Safety:** Full TypeScript implementation with shared types between client and server via the `/shared` directory.

### Backend Architecture

**Runtime:** Node.js with Express.js as the web framework.

**API Design:** RESTful API structure with the following key endpoints:
- POST `/api/topics` - Create topic and generate subtopics
- GET `/api/topics/:id` - Retrieve topic with subtopics
- GET `/api/subtopics/:id` - Retrieve individual subtopic
- GET `/api/subtopics/:id/content` - Retrieve or generate subtopic content
- Progress tracking endpoints for user quiz results

**Development Server:** Custom Vite middleware integration for hot module replacement during development, with static file serving in production.

**Error Handling:** Centralized error handling with request/response logging middleware that captures API calls, response times, and status codes.

### Data Storage

**Database:** PostgreSQL accessed via Neon serverless driver with WebSocket support.

**ORM:** Drizzle ORM for type-safe database operations with the following schema:

- `users` - User accounts (id, username, password)
- `topics` - Main topics created by users (id, userId, title, description)
- `subtopics` - AI-generated subdivisions of topics (id, topicId, title, orderIndex)
- `subtopic_content` - Generated educational content (id, subtopicId, explanation, examples, quizQuestions as JSON)
- `user_progress` - Quiz tracking (id, userId, subtopicId, questionsAttempted, questionsCorrect)

**Schema Design Rationale:** Normalized structure separating topics, subtopics, and content allows for efficient querying and caching of AI-generated content. The orderIndex in subtopics maintains the learning path sequence.

**Migrations:** Managed via Drizzle Kit with migration files in the `/migrations` directory.

### Authentication & Authorization

**Current Implementation:** Test user mode with hardcoded user ID (`test-user-123`) for development.

**Planned Implementation:** The schema includes user authentication tables (username, password) suggesting future implementation of proper authentication. The storage layer includes user lookup methods.

### AI Content Generation

**Service:** OpenAI GPT-4-mini for cost-effective content generation.

**Content Types Generated:**
1. **Subtopics:** Six key subtopics per main topic in logical learning order
2. **Explanations:** Detailed educational content for each subtopic
3. **Examples:** Practical examples demonstrating concepts
4. **Quiz Questions:** Multiple-choice questions with four options and correct answer indices

**Implementation Strategy:** 
- Structured JSON responses using OpenAI's `response_format: { type: "json_object" }`
- Temperature set to 0.7 for balanced creativity and consistency
- Separate API calls for subtopic generation and content generation to optimize cost and response time
- Content is generated on-demand and cached in the database

**Error Handling:** Fallback mechanisms for API failures with user-friendly error messages.

## External Dependencies

### Third-Party APIs

**OpenAI API:** GPT-4-mini model for generating educational content, subtopics, and quiz questions. Requires `OPENAI_API_KEY` environment variable.

### Database Service

**Neon Serverless PostgreSQL:** Cloud-hosted PostgreSQL database with serverless architecture. Requires `DATABASE_URL` environment variable with connection string.

### UI Component Libraries

**Radix UI Primitives:** Comprehensive set of unstyled, accessible component primitives:
- Dialog, Popover, Dropdown Menu for overlays
- Radio Group, Checkbox, Switch for form inputs
- Accordion, Tabs, Collapsible for content organization
- Toast for notifications
- Multiple other utility components

**Recharts:** Data visualization library for rendering donut charts in the profile dashboard showing quiz performance statistics.

### Supporting Libraries

**Wouter:** Minimalist routing library (3KB alternative to React Router)

**TanStack Query:** Async state management with built-in caching and refetching

**React Hook Form + Zod:** Form handling with schema validation (via @hookform/resolvers)

**Tailwind CSS:** Utility-first CSS framework with PostCSS and Autoprefixer

**class-variance-authority & clsx:** Utility libraries for conditional className composition

**date-fns:** Date manipulation and formatting

**Lucide React:** Icon library for consistent iconography

### Development Tools

**TypeScript:** Type checking across the entire stack

**Vite:** Build tool and dev server with plugins:
- @vitejs/plugin-react for React Fast Refresh
- @replit/vite-plugin-runtime-error-modal for error overlay
- @replit/vite-plugin-cartographer for code navigation (Replit only)
- @replit/vite-plugin-dev-banner for development indicators (Replit only)

**Drizzle Kit:** Database migration management and schema push utilities

**esbuild:** Fast JavaScript bundler for server-side code in production builds