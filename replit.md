# AI Study Helper

## Overview

AI Study Helper is a web application that helps students with their studies using AI-powered tools. The app provides three main features: solving questions with step-by-step explanations, summarizing notes into key points, and generating multiple-choice quizzes from topics. Users can upload files (images, PDFs, Word documents) or paste text directly, and the AI processes the content to provide educational assistance.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for transitions
- **Build Tool**: Vite with HMR support

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/`
- Reusable UI components in `client/src/components/ui/` (shadcn)
- Custom hooks in `client/src/hooks/`
- Shared types and schemas imported from `@shared/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API via Replit AI Integrations
- **File Processing**: Tesseract.js (OCR), pdf-parse, mammoth (Word docs)

Key backend patterns:
- Routes registered in `server/routes.ts`
- Database connection in `server/db.ts`
- Storage layer abstraction in `server/storage.ts`
- Replit integrations in `server/replit_integrations/` for chat, images, and batch processing

### Data Flow
1. User submits content (text or file) via the frontend form
2. Files are converted to base64 and sent to the backend
3. Backend extracts text from files using appropriate parsers
4. OpenAI generates the response based on request type (solve/summarize/mcq)
5. Result is stored in history and returned to the client

### Rate Limiting
- In-memory rate limiting: 5 requests per day per IP
- Resets daily at midnight
- Simple implementation without authentication

## External Dependencies

### Database
- **PostgreSQL**: Primary data store
- **Drizzle ORM**: Type-safe database queries and migrations
- Schema defined in `shared/schema.ts` and `shared/models/chat.ts`
- Migrations output to `./migrations/`

### AI Services
- **OpenAI API**: Via Replit AI Integrations
- Environment variables: `AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`
- Used for text generation and image generation

### File Processing Libraries
- **Tesseract.js**: OCR for extracting text from images
- **pdf-parse**: PDF text extraction
- **mammoth**: Word document (.docx) text extraction

### Frontend Libraries
- **react-markdown**: Rendering AI-generated markdown content
- **date-fns**: Date formatting for history items
- **Radix UI primitives**: Accessible component foundations for shadcn/ui