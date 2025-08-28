# Backend Test Cases

This document outlines all the test cases implemented in the backend testing suite.

## Overview

The backend testing suite uses **Jest** with **Supertest** to provide comprehensive coverage of utilities, middleware, controllers, and services.

## Test Structure

### Test Files Location
- `src/utils/__tests__/` - Utility function tests
- `src/middleware/__tests__/` - Middleware tests
- `src/controllers/__tests__/` - Controller tests
- `src/services/__tests__/` - Service tests (to be implemented)
- `src/__tests__/` - Test utilities and setup

## Test Cases

### 1. Utility Function Tests

#### 1.1 Enum Utilities Tests
**File:** `src/utils/__tests__/enum.test.ts`

- **TC-001**: getDefaultRFPStatuses should return all default RFP statuses
  - Validates 5 statuses: Draft, Published, Under Review, Approved, Rejected
  - Checks correct structure with code and label properties
- **TC-002**: getDefaultSupplierResponseStatuses should return all default supplier response statuses
  - Validates 4 statuses: Draft, Submitted, Approved, Rejected
  - Checks correct structure with code and label properties
- **TC-003**: getDefaultRoles should return all default roles with permissions
  - Validates Buyer and Supplier roles
  - Checks permissions structure and specific permissions for each role

#### 1.2 Filter Utilities Tests
**File:** `src/utils/__tests__/filters.test.ts`

- **TC-004**: buildGeneralFilters should handle empty filters
  - Returns empty object when no filters provided
- **TC-005**: buildGeneralFilters should build search filter
  - Creates OR condition for title search with case-insensitive matching
- **TC-006**: buildGeneralFilters should build status filter
  - Creates status filter with nested code property
- **TC-007**: buildGeneralFilters should build buyer_id filter
  - Creates direct buyer_id filter
- **TC-008**: buildGeneralFilters should build combined filters
  - Combines multiple filter types correctly
- **TC-009**: buildVersionGeneralFilters should handle empty filters
  - Returns empty object when no filters provided
- **TC-010**: buildVersionGeneralFilters should build search filter for versions
  - Creates nested version search across description, requirements, and notes
- **TC-011**: buildVersionGeneralFilters should build budget filters
  - Creates version-based budget range filters
- **TC-012**: buildVersionGeneralFilters should build deadline filters
  - Creates version-based deadline range filters
- **TC-013**: buildVersionGeneralFilters should build combined version filters
  - Combines search, budget, and deadline filters for versions

### 2. Middleware Tests

#### 2.1 Authentication Middleware Tests
**File:** `src/middleware/__tests__/auth.middleware.test.ts`

##### protect middleware
- **TC-014**: Should return 401 if no authorization header
  - Tests missing authorization header scenario
- **TC-015**: Should return 401 if authorization header invalid format
  - Tests authorization header without Bearer prefix
- **TC-016**: Should return 401 if token is invalid
  - Tests JWT verification failure
- **TC-017**: Should return 404 if user not found
  - Tests database lookup failure for user
- **TC-018**: Should set user and call next if token is valid
  - Tests successful authentication flow
- **TC-019**: Should handle database errors gracefully
  - Tests database connection errors

##### hasPermission middleware
- **TC-020**: Should call next if user has permission
  - Tests successful permission check
- **TC-021**: Should return 403 if user does not have permission
  - Tests permission denial for unauthorized actions
- **TC-022**: Should return 403 if user is not authenticated
  - Tests unauthenticated access attempts
- **TC-023**: Should return 403 if resource does not exist in permissions
  - Tests access to non-existent resources
- **TC-024**: Should return 403 if action does not exist in permissions
  - Tests non-existent actions on valid resources
- **TC-025**: Should handle permissions with allowed: false
  - Tests explicitly denied permissions

### 3. Controller Tests

#### 3.1 Authentication Controller Tests
**File:** `src/controllers/__tests__/auth.controller.test.ts`

##### register endpoint
- **TC-026**: Should register a new user successfully
  - Tests successful user registration with valid data
- **TC-027**: Should return 400 if email already exists
  - Tests duplicate email registration attempt
- **TC-028**: Should return 400 if role does not exist
  - Tests registration with invalid role
- **TC-029**: Should return 400 for invalid input data
  - Tests validation error handling
- **TC-030**: Should handle database errors
  - Tests database connection/operation errors

##### login endpoint
- **TC-031**: Should login user successfully
  - Tests successful login with valid credentials
- **TC-032**: Should return 401 for non-existent user
  - Tests login attempt with non-existent email
- **TC-033**: Should return 401 for incorrect password
  - Tests login attempt with wrong password
- **TC-034**: Should return 400 for invalid input data
  - Tests validation error handling
- **TC-035**: Should handle database errors
  - Tests database connection/operation errors

#### 3.2 RFP Controller Tests
**File:** `src/controllers/__tests__/rfp.controller.test.ts`

##### createRfp endpoint
- **TC-036**: Should create RFP successfully
  - Tests successful RFP creation with valid data
- **TC-037**: Should return 400 for invalid input data
  - Tests validation error handling
- **TC-038**: Should handle service errors
  - Tests service layer error handling

##### getMyRfps endpoint
- **TC-039**: Should get user RFPs successfully
  - Tests successful retrieval of user's RFPs with pagination
- **TC-040**: Should handle invalid query parameters
  - Tests parameter validation and defaults
- **TC-041**: Should handle service errors
  - Tests service layer error handling

##### getRfpById endpoint
- **TC-042**: Should get RFP by ID successfully
  - Tests successful RFP retrieval by ID
- **TC-043**: Should return 404 if RFP not found
  - Tests handling of non-existent RFP
- **TC-044**: Should handle service errors
  - Tests service layer error handling

##### updateRfp endpoint
- **TC-045**: Should update RFP successfully
  - Tests successful RFP update
- **TC-046**: Should return 400 for invalid input data
  - Tests validation error handling
- **TC-047**: Should handle service errors
  - Tests service layer error handling

##### deleteRfp endpoint
- **TC-048**: Should delete RFP successfully
  - Tests successful RFP deletion
- **TC-049**: Should handle service errors
  - Tests service layer error handling

##### publishRfp endpoint
- **TC-050**: Should publish RFP successfully
  - Tests successful RFP publishing
- **TC-051**: Should handle service errors
  - Tests service layer error handling

## Test Configuration

### Testing Framework
- **Jest**: Testing framework with TypeScript support
- **Supertest**: HTTP assertion library for API testing
- **ts-jest**: TypeScript preprocessor for Jest

### Mock Strategy
- **Database Mocking**: Prisma Client is mocked for all database operations
- **External Services**: SendGrid, Socket.IO, Cloudinary are mocked
- **Authentication**: JWT and bcrypt operations are mocked
- **Environment Variables**: Test-specific environment configuration

### Test Setup
- **Global Setup**: `src/__tests__/setup.ts`
  - Mocks all external dependencies
  - Sets up test environment variables
  - Configures Jest test environment

### Test Utilities
- **Mock Data**: `src/__tests__/utils.ts`
  - Provides mock users, RFPs, responses, and roles
  - Helper functions for creating mock requests/responses
  - Authentication utilities for testing protected endpoints

## Test Execution

### Commands
- `pnpm test`: Run tests in watch mode
- `pnpm test:coverage`: Run tests with coverage report
- `pnpm test:ci`: Run tests in CI mode with coverage
- `pnpm test:watch`: Run tests in watch mode

### Coverage Requirements
- **Minimum Coverage**: 80% for all code coverage metrics
- **Critical Paths**: 100% coverage for authentication and authorization
- **Business Logic**: 90% coverage for core business logic

## Quality Assurance

### Code Quality
- All tests follow AAA pattern (Arrange, Act, Assert)
- Tests are isolated and don't depend on each other
- Comprehensive error scenario coverage
- Mock data consistency across tests

### Security Testing
- Authentication bypass attempts
- Authorization validation
- Input validation and sanitization
- SQL injection prevention (via ORM)

### Performance Testing
- Database query optimization verification
- API response time validation
- Memory leak detection in long-running operations

## Future Enhancements
- Integration tests with real database (test containers)
- API documentation testing with OpenAPI
- Load testing for high-traffic scenarios
- Security penetration testing
- End-to-end workflow testing

## Notes

### Test Isolation
- Each test uses fresh mock instances
- Database state is mocked and reset between tests
- No shared state between test suites

### Error Handling
- Comprehensive error scenario coverage
- Database error simulation
- Network error simulation
- Validation error testing

### Mock Accuracy
- Mocks accurately represent real service behavior
- Mock data follows actual database schema
- Authentication flows match production implementation
