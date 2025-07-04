# Wedding Website Test Suite

This comprehensive test suite covers all functionality of the wedding website including admin features, API endpoints, database operations, and React components.

## Test Categories

### 1. API Tests (`api.test.ts`)
Tests all REST API endpoints:

**Wedding Details API:**
- ✅ Create default wedding details if none exist
- ✅ Update wedding details with validation
- ✅ Handle invalid data with proper error responses

**Photos API:**
- ✅ Get photos with approval filtering
- ✅ Handle photo upload validation
- ✅ Toggle photo likes with session tracking
- ✅ Delete photos and associated likes
- ✅ Approve photos (admin function)

**Playlist API:**
- ✅ Add songs to playlist with validation
- ✅ Toggle song likes with session tracking
- ✅ Delete songs and associated likes
- ✅ Filter approved songs only

**User Session Handling:**
- ✅ Track likes from different user sessions
- ✅ Prevent duplicate likes from same user
- ✅ Handle concurrent likes properly

### 2. Storage Tests (`storage.test.ts`)
Tests database operations directly:

**Photo Storage:**
- ✅ Create and retrieve photos
- ✅ Filter by approval status
- ✅ Approve photos
- ✅ Delete photos with cascade
- ✅ Handle like counting accurately

**Playlist Storage:**
- ✅ Create and retrieve songs
- ✅ Filter approved songs only
- ✅ Handle song likes correctly
- ✅ Delete songs with cascade

**Wedding Details Storage:**
- ✅ Create wedding details
- ✅ Retrieve wedding details
- ✅ Update wedding details partially
- ✅ Handle missing details gracefully

### 3. Component Tests (`components.test.tsx`)
Tests React components:

**CountdownTimer:**
- ✅ Display countdown for future dates
- ✅ Show wedding day message for past dates
- ✅ Update countdown in real-time

**PhotoUpload:**
- ✅ Render upload interface
- ✅ Enable/disable upload button based on file selection
- ✅ Handle file selection properly

**Playlist:**
- ✅ Render playlist interface
- ✅ Add songs via form submission
- ✅ Show empty state appropriately

**AdminPanel:**
- ✅ Show login form when not authenticated
- ✅ Authenticate with correct password (admin123)
- ✅ Show admin interface after login
- ✅ Update wedding details
- ✅ Toggle settings switches

### 4. Integration Tests (`integration.test.ts`)
Tests complete workflows:

**Full Wedding Website Workflow:**
- ✅ Complete user journey from setup to usage
- ✅ Wedding details management
- ✅ Photo upload and approval workflow
- ✅ Playlist creation and voting
- ✅ Multi-user like interactions
- ✅ Admin moderation workflows

**Admin Workflow:**
- ✅ Auto-approval when moderation disabled
- ✅ Bulk operations handling
- ✅ Concurrent user interactions
- ✅ High-load like scenarios

**Error Handling:**
- ✅ Invalid operations on non-existent items
- ✅ Data validation errors
- ✅ Feature toggling (uploads disabled)

## Admin Functions Tested

### Authentication
- Password-based admin login (password: admin123)
- Session management for admin access

### Wedding Details Management
- Update couple names, wedding date, venue
- Toggle upload permissions
- Enable/disable moderation
- Venue address management

### Photo Moderation
- Approve pending photos
- Delete inappropriate photos
- Bulk photo management
- Photo metadata export

### Content Management
- Song approval/deletion
- Like count monitoring
- User session tracking
- Content filtering

### Settings Management
- Upload permission control
- Moderation toggle
- Feature enabling/disabling

## Test Data and Scenarios

### Test Users
- Multiple simulated user sessions
- Concurrent interaction testing
- Like/unlike behavior validation

### Test Content
- Sample photos with various approval states
- Music playlist with different genres
- Wedding details with various configurations

### Edge Cases
- Invalid date formats
- Missing required fields
- Non-existent resource operations
- High-volume concurrent operations

## Running Tests

### Individual Test Suites
```bash
# API tests only
npx vitest run tests/api.test.ts

# Storage tests only
npx vitest run tests/storage.test.ts

# Component tests only
npx vitest run tests/components.test.tsx

# Integration tests only
npx vitest run tests/integration.test.ts
```

### All Tests
```bash
# Run all tests
./test.sh

# Or use vitest directly
npx vitest run
```

### Test Coverage
```bash
npx vitest run --coverage
```

## Mock Data and Setup

The test suite uses real database operations with cleanup between tests, ensuring:
- Isolated test execution
- Realistic data interactions
- Proper cleanup after tests
- Concurrent operation safety

## Admin Testing Features

### Photo Management Testing
- Upload simulation with file validation
- Approval workflow testing
- Bulk photo operations
- Like counting accuracy

### Playlist Management Testing
- Song addition with metadata parsing
- Like tracking across multiple users
- Deletion and cleanup operations
- Approval state management

### Settings Testing
- Upload permission toggling
- Moderation enable/disable
- Wedding detail updates
- Configuration persistence

All admin functions are thoroughly tested to ensure proper functionality and security.