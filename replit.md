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
- July 04, 2025. **Major UI/UX Enhancement Package**: Implemented comprehensive improvements across all components:
  - **Countdown Timer**: Added urgency indicators with pulsating effects and color changes for final week
  - **Photo Gallery**: Enhanced with responsive masonry layout for optimal space utilization
  - **Playlist**: Implemented intelligent song parsing (Artist-Title, Title by Artist patterns) and duplicate prevention
  - **Navigation**: Added smooth scrolling with header offset and active section highlighting
  - **Admin Panel**: Enhanced with bulk operations (approve all/delete all) for efficient photo moderation
  - **CSS Enhancements**: Added custom wedding-themed animations, transitions, and responsive design improvements
- July 05, 2025. **AI-Powered Photo Enhancement System**: Implemented comprehensive AI analysis using OpenAI GPT-4 Vision:
  - **AI Analysis Engine**: Created intelligent photo analysis system that evaluates lighting, composition, color, technical quality, and artistic elements
  - **Enhancement Suggestions**: Provides categorized improvement recommendations with severity levels and confidence scores
  - **Wedding Context Understanding**: AI recognizes photo types (ceremony, reception, portraits) and adapts suggestions accordingly
  - **Smart UI Integration**: Added AI enhancer buttons to photo gallery with beautiful gradient styling and comprehensive analysis dialog
  - **Database Storage**: Full enhancement analysis persistence with visibility controls for admin management
  - **Professional Presentation**: Detailed analysis results with overall scores, strengths, issues, and enhancement previews
- July 05, 2025. **AI Model Migration**: Updated AI photo enhancement system from deprecated Groq Llama 3.2 Vision to current Llama 4 Scout model:
  - **Model Update**: Migrated from `llama-3.2-11b-vision-preview` to `meta-llama/llama-4-scout-17b-16e-instruct`
  - **Parameter Updates**: Updated API parameters from `max_tokens` to `max_completion_tokens` for Llama 4 compatibility
  - **Error Handling**: Improved TypeScript error handling and fallback mechanisms
  - **Performance**: Enhanced analysis speed and accuracy with the newer Llama 4 Scout model (460+ tokens/second)
- July 05, 2025. **Czech Language Support**: Implemented complete Czech localization for AI photo analysis:
  - **System Prompts**: Updated all AI prompts to request responses in Czech language
  - **JSON Schema**: Fixed and improved JSON format validation for Czech text content
  - **Error Handling**: Resolved JSON parsing issues with Czech characters and format validation
  - **User Experience**: All AI analysis results now display in Czech including suggestions, strengths, and enhancement previews
- July 05, 2025. **Android Native App Design**: Complete redesign of photo gallery to match Android Material Design:
  - **App Bar**: Android-style sticky header with app icon, title, and action buttons
  - **Material Cards**: Instagram-like card layout with expandable content and user avatars
  - **View Modes**: Three distinct layouts - Cards (social feed), Grid (photo grid), List (compact list)
  - **Search & Filters**: Collapsible search bar and filter menu with Material Design chips
  - **Interactions**: Android-style rounded buttons, Material shadows, and native-feeling transitions
  - **Full-Screen Viewer**: Android photo viewer with status bar overlay and bottom action bar
  - **Comments UI**: Material Design bottom sheet style with avatar circles and rounded chat bubbles
  - **Touch Interactions**: Optimized for mobile with proper touch targets and gesture feedback
- July 05, 2025. **Comprehensive AI Integration**: Added complete AI-powered wedding assistance features:
  - **AI Services Architecture**: OpenAI GPT-4o integration with multiple specialized AI functions
  - **AI Photo Analysis**: Intelligent photo analysis with scoring for composition, lighting, colors, emotion, and technical quality
  - **AI Photo Captions**: Automatic generation of beautiful Czech captions for wedding photos
  - **AI Playlist Suggestions**: Smart music recommendations based on wedding style, couple preferences, and specific moments
  - **AI Wedding Advice**: Personalized planning advice considering date, venue, guest count, and Czech traditions
  - **AI Guest Message Analysis**: Sentiment analysis and appropriateness checking for guest messages
  - **AI Wedding Stories**: Automatic generation of romantic wedding stories from photos and timeline
  - **Database Schema**: Extended schema with 5 new AI tables for comprehensive data storage
  - **Material Design UI**: Beautiful tabbed interface with gradient styling and real-time AI interaction
  - **Admin Integration**: Full AI content moderation and approval workflows
- July 06, 2025. **Bug Fixes and Code Quality Improvements**: Comprehensive bug analysis and fixes:
  - **Critical Fix**: Removed duplicate `createPhotoEnhancement` method in storage.ts that caused compilation warnings
  - **Cache Management Fix**: Fixed inconsistent cache updates in photo like system to maintain data synchronization across all query states
  - **Missing Implementation Fix**: Added missing Cloudinary photo methods (`getCloudinaryPhotos`, `syncCloudinaryPhotos`, `toggleCloudinaryPhotoLike`) to storage interface and implementation
  - **API Consistency**: All Cloudinary endpoints now properly functional with complete CRUD operations
  - **Type Safety**: Enhanced TypeScript type consistency across storage interface and implementation
- July 06, 2025. **Hugging Face AI Integration**: Added complete Hugging Face AI model support:
  - **AI Service**: Created new `huggingface-ai.ts` service with intelligent image analysis capabilities
  - **Smart Analysis**: Implemented context-aware photo description generation with wedding-specific insights
  - **API Endpoints**: Added three new endpoints - `/api/huggingface/status`, `/api/huggingface/analyze-photo`, `/api/huggingface/generate-caption`
  - **React Component**: Built comprehensive `HuggingFaceAI` component with tabbed interface, real-time analysis, and progress tracking
  - **UI Integration**: Added Hugging Face tab to AI Features panel with photo selection, analysis results, and caption generation
  - **Error Handling**: Robust fallback system with intelligent mock analysis when API models are unavailable
  - **Czech Language**: Full Czech language support for all analysis results, suggestions, and captions
- July 06, 2025. **AI Photo Enhancement Bug Fixes**: Fixed critical model compatibility issues:
  - **Model Updates**: Fixed deprecated model references (`gemini-1.5-flash-8b` → `gemini-1.5-flash`)
  - **Groq API**: Updated to use current Llama 4 Scout model (`meta-llama/llama-4-scout-17b-16e-instruct`)
  - **Error Resolution**: Eliminated 500 Internal Server Error in photo analysis endpoint
  - **Fallback Improvements**: Enhanced fallback system for enhancement preview generation
  - **Google Gemini**: Successfully integrated Google Gemini 1.5 Flash for primary AI photo analysis
  - **API Stability**: All AI photo enhancement endpoints now working reliably
- July 06, 2025. **Navigation Redesign**: Completely reworked main menu to remove Android native styling:
  - **Header Navigation**: Replaced Android-style app bar with clean web header navigation
  - **Desktop Menu**: Added horizontal navigation with icon-text buttons in header
  - **Mobile Menu**: Implemented collapsible mobile navigation under header
  - **UI Cleanup**: Removed Android status bar, bottom navigation, and Material Design elements
  - **Web-First Design**: Switched to traditional web navigation patterns with better desktop experience
- July 06, 2025. **Smart Navigation Enhancement**: Added intelligent navigation features:
  - **Auto Section Detection**: Scroll-based active section highlighting with smart positioning detection
  - **Progress Tracking**: Visual scroll progress bar in header with gradient styling
  - **Animated Indicators**: Smooth motion animations for active states and section completion
  - **Breadcrumb Navigation**: Current section display in header with real-time updates
  - **Keyboard Navigation**: Alt+Arrow keys for section navigation, Escape for mobile menu
  - **Smart Mobile Menu**: Animated hamburger button with staggered menu item animations
  - **Floating Controls**: Back-to-top button with scroll threshold and navigation helper tooltips
  - **Completion Tracking**: Visual indicators for visited sections and progress status

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