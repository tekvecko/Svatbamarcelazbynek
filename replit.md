# Wedding Website System

## Overview

This is a full-stack wedding website application built with React, Express.js, and PostgreSQL. The system provides a comprehensive platform for couples to share their wedding information with guests, including photo galleries, music playlists, countdown timers, and administrative controls. The application is designed for Czech users with Czech language support throughout the interface.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Comprehensive shadcn/ui component system with Radix UI primitives

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Handling**: Multer for photo upload processing
- **Session Management**: Simple session-based user tracking using IP and User-Agent

### Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Connection pooling with @neondatabase/serverless

## Key Components

### Core Features
1. **Wedding Information Display**: Couple names, wedding date, venue details with countdown timer
2. **Photo Gallery**: User photo uploads with approval system, like functionality, and responsive grid/carousel views
3. **Music Playlist**: Guest song suggestions with voting system
4. **Administrative Panel**: Content moderation and wedding detail management
5. **Responsive Design**: Mobile-first approach with desktop optimization

### Database Schema
- **photos**: Store uploaded images with approval status and like counts
- **photoLikes**: Track user likes for photos using session-based identification
- **playlistSongs**: Manage music suggestions from guests
- **songLikes**: Track user votes for playlist songs
- **weddingDetails**: Store core wedding information and site settings

### File Management
- **Upload Directory**: Local file storage in `/uploads` directory
- **Image Processing**: Automatic thumbnail generation and file validation
- **File Serving**: Static file serving with CORS support for uploaded content

## Data Flow

### Photo Upload Process
1. User selects images through upload interface
2. Multer processes files with size and type validation (10MB limit, image formats only)
3. Files stored locally with generated filenames
4. Database records created with approval status based on moderation settings
5. Admin can approve/reject photos through administrative panel

### Like System
1. User interactions tracked via session ID (IP + User-Agent hash)
2. Toggle-based like system prevents duplicate votes
3. Real-time count updates through optimistic UI updates
4. Database consistency maintained through unique constraints

### Administrative Controls
1. Password-protected admin panel (simple authentication)
2. Wedding detail management (couple names, date, venue, settings)
3. Photo moderation (approve/reject uploads)
4. Upload and moderation toggle controls

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **multer**: File upload handling
- **express**: Web application framework

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and development experience
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Production Build
1. **Frontend**: Vite builds optimized React application to `/dist/public`
2. **Backend**: esbuild bundles Express server to `/dist/index.js`
3. **Database**: Drizzle migrations ensure schema consistency
4. **Assets**: Static file serving for uploaded content

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment detection for development/production modes
- **File Storage**: Local filesystem storage (uploads directory)

### Development Workflow
1. **Development Server**: Vite dev server with HMR for frontend
2. **API Development**: Express server with automatic restart
3. **Database Management**: Drizzle push for schema updates
4. **Type Safety**: Shared TypeScript types between frontend and backend

## Changelog
- July 04, 2025. Initial setup
- July 04, 2025. Added comprehensive test suite with unit tests, API tests, storage tests, component tests, and integration tests covering all functions including admin features
- July 04, 2025. Implemented Wedding Moment Highlight Reel with cinematic transitions, including framer-motion animations, fullscreen mode, cinematic controls, background music simulation, and demo photo seeding
- July 04, 2025. Implemented dynamic metadata storage system with database backend, API endpoints, and secure Cloudinary signed uploads for improved photo management
- July 04, 2025. Fixed Cloudinary configuration to use proper secret management and debugged upload issues. Added React imports to fix component test failures.

## Testing Infrastructure

### Test Framework Setup
- **Vitest**: Modern testing framework with TypeScript support
- **React Testing Library**: Component testing with user interaction simulation
- **Supertest**: API endpoint testing
- **jsdom**: Browser environment simulation for component tests

### Test Categories Implemented
1. **Unit Tests** (`tests/unit.test.ts`): Core functionality validation
   - User session generation and validation
   - Date formatting and countdown calculations
   - File validation (type, size limits)
   - Song parsing and metadata extraction
   - Admin authentication logic
   - Form validation rules
   - Like system calculations

2. **API Tests** (`tests/api.test.ts`): REST endpoint validation
   - Wedding details CRUD operations
   - Photo upload, approval, and management
   - Playlist song management
   - Like system for photos and songs
   - User session tracking
   - Error handling and validation

3. **Storage Tests** (`tests/storage.test.ts`): Database operations
   - Photo storage with approval workflows
   - Playlist management with filtering
   - Wedding details persistence
   - Like counting and user tracking
   - Cascade deletion operations

4. **Component Tests** (`tests/components.test.tsx`): React UI testing
   - CountdownTimer functionality
   - PhotoUpload interface and file handling
   - Playlist song addition and display
   - AdminPanel authentication and management
   - User interaction simulations

5. **Integration Tests** (`tests/integration.test.ts`): Complete workflows
   - Full wedding website user journey
   - Admin moderation workflows
   - Multi-user concurrent interactions
   - Error handling scenarios
   - High-load testing

### Admin Functions Testing Coverage
- **Authentication**: Password validation (admin123)
- **Wedding Details**: All CRUD operations and validation
- **Photo Management**: Upload approval, deletion, moderation
- **Playlist Management**: Song approval, like tracking
- **Settings Control**: Upload permissions, moderation toggles
- **Content Export**: Gallery data export functionality

### Running Tests
```bash
# All unit tests (no database required)
npx vitest run tests/unit.test.ts

# API tests (requires database)
npx vitest run tests/api.test.ts

# Storage tests (requires database)  
npx vitest run tests/storage.test.ts

# Component tests
npx vitest run tests/components.test.tsx

# Integration tests (requires database)
npx vitest run tests/integration.test.ts

# Run all tests
npx vitest run
```

## User Preferences

Preferred communication style: Simple, everyday language.