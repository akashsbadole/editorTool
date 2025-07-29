# CodeCraft - AI Code Generation Platform

## Overview

CodeCraft is a full-stack web application that enables users to generate production-ready code using AI. The platform integrates with Ollama AI models to generate complete file structures and code based on user prompts. Users can specify package types (frontend, backend, full-stack, etc.) and provide natural language descriptions to receive functional code packages.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Code Editor**: Monaco Editor for syntax highlighting and code editing

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Ollama API for code generation
- **Session Management**: In-memory storage with fallback to database
- **API Design**: RESTful endpoints with streaming support

### Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database
- **ORM**: Drizzle ORM with TypeScript-first schema definitions
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Cache**: MemStorage class for development/testing

## Key Components

### Core Features
1. **AI Code Generation**: Integration with Ollama models for code generation
2. **Real-time Streaming**: Server-sent events for live generation feedback
3. **Code Editor**: Monaco-based editor with syntax highlighting
4. **File Management**: Tree-based file explorer and management
5. **Project History**: Storage and retrieval of previous generations
6. **Export Functionality**: ZIP download of generated code

### Frontend Components
- **Home Page**: Main interface for code generation requests
- **Code Editor**: Monaco editor with theme support and fullscreen mode
- **File Tree**: Hierarchical file browser with folder expansion
- **Streaming Modal**: Real-time generation progress with live updates
- **History Modal**: Browse and reuse previous code generations
- **Theme Provider**: Light/dark mode support

### Backend Services
- **Route Handlers**: Express routes for CRUD operations on prompts
- **Ollama Integration**: Streaming AI model communication
- **Storage Abstraction**: Interface-based storage with memory and database implementations
- **File Processing**: Code parsing and organization utilities

## Data Flow

1. **User Input**: User selects package type and enters natural language description
2. **Prompt Creation**: Frontend creates prompt record via POST /api/prompts
3. **AI Generation**: Backend streams to Ollama API with structured prompts
4. **Real-time Updates**: Server-sent events stream generation progress to frontend
5. **File Processing**: Generated code is parsed and organized into file structure
6. **Storage**: Completed generations stored in database with metadata
7. **Display**: Frontend renders file tree and code editor for exploration

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL serverless driver
- **drizzle-orm**: TypeScript ORM for database operations
- **@tanstack/react-query**: Server state management
- **monaco-editor**: Code editor component
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework

### AI Integration
- **Ollama API**: Local AI model hosting (configurable endpoint)
- **Streaming Support**: Real-time generation feedback
- **Model Configuration**: Configurable model selection and parameters

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across frontend and backend
- **ESLint/Prettier**: Code formatting and linting
- **Drizzle Kit**: Database schema management

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite dev server with Express API proxy
- **Hot Reload**: Full-stack hot module replacement
- **Database**: Development PostgreSQL instance
- **AI Service**: Local Ollama installation

### Production Build
- **Frontend**: Static build served by Express
- **Backend**: Compiled TypeScript bundle
- **Environment Variables**: Database URL, Ollama endpoint configuration
- **Asset Optimization**: Vite production optimizations

### Database Management
- **Migrations**: Drizzle Kit push command for schema updates
- **Connection Pooling**: Neon serverless connection management
- **Schema Validation**: TypeScript-enforced schema consistency

### Scalability Considerations
- **Stateless Backend**: Session data can be moved to database
- **AI Service**: Configurable Ollama endpoint for distributed deployment
- **File Storage**: Generated code stored in database for persistence
- **Caching**: Client-side caching via TanStack Query