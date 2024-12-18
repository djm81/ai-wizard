# This file contains errors that have occured by the AI generated code and the steps to fix them as well as to avoid them in the future.

## SQLite Threading Issues

### Error
When using SQLite with FastAPI/async code, the error "SQLite objects created in a thread can only be used in that same thread" occurs because SQLite connections are thread-local by default.

### Root Cause
1. SQLite is designed to be thread-local for safety
2. FastAPI's async nature means different parts of a request might be handled in different threads
3. The default SQLAlchemy session setup doesn't account for this threading behavior

### Solution
1. Use `connect_args={"check_same_thread": False}` for SQLite connections
2. Implement proper session management using ContextVar to ensure thread safety
3. Add connection pooling configuration
4. Set `expire_on_commit=False` to prevent detached instance errors
5. Properly close sessions after each request

### Prevention
When working with SQLite in async applications:
1. Always use context variables for session management
2. Configure proper connection pooling
3. Handle session cleanup properly
4. Consider using PostgreSQL for production if heavy concurrent access is needed
5. Add proper error handling and logging for database operations

## FastAPI Async Generator Type Hints

### Error
Type error in async generator function: "AsyncGenerator[Any, Any, Any]" is not compatible with "Session"

### Root Cause
1. FastAPI's dependency injection system expects proper async generator type hints
2. When using `yield` in an async function, the return type must be `AsyncGenerator`
3. The type hint must specify both the yielded type and the return type (None for generators)

### Solution
1. Use `AsyncGenerator[YieldType, None]` as return type hint for async generator functions
2. Import AsyncGenerator from typing module
3. Properly structure the async generator function with yield and return statements

### Prevention
When working with FastAPI async dependencies:
1. Always use proper type hints for async generators
2. Remember that async functions with `yield` are generators
3. Use `AsyncGenerator[YieldType, None]` for dependencies that yield values
4. Ensure the function has both yield and proper return flow
5. Consider using FastAPI's dependency system's built-in types when available

## Frontend API Request Loops

### Error
Frontend makes repeated API requests in a loop due to FastAPI's automatic trailing slash redirection and React's strict mode double-rendering.

### Root Cause
1. FastAPI redirects requests from `/api/projects` to `/api/projects/` with 307 status
2. React's strict mode causes components to mount twice in development
3. Missing trailing slashes in API URLs cause unnecessary redirects
4. Each redirect triggers a new request, which can cause loops in development

### Solution
1. Always use trailing slashes in API URLs from frontend
2. Handle React strict mode effects properly
3. Consider disabling FastAPI's automatic slash redirection if not needed
4. Add proper cleanup in useEffect hooks

### Prevention
When working with FastAPI and React:
1. Always use trailing slashes in API URLs
2. Be aware of React strict mode's double-mounting behavior
3. Use proper dependency arrays in useEffect
4. Add cleanup functions to useEffect hooks
5. Consider using React Query or similar libraries for better request management

## TypeScript File Extensions

### Error
Having both `.ts` and `.tsx` files for the same module causes confusion and potential import conflicts.

### Root Cause
1. `.tsx` extension is specifically for files containing JSX/TSX (React components)
2. `.ts` extension is for pure TypeScript files (types, interfaces, utilities)
3. Having both can cause module resolution issues and confusion

### Solution
1. Use `.tsx` only for files containing React components/JSX
2. Use `.ts` for files containing only TypeScript code (no JSX)
3. Remove duplicate type definition files

### Prevention
When working with TypeScript in React projects:
1. Use `.tsx` extension only when the file contains JSX/React components
2. Use `.ts` extension for pure TypeScript files (types, interfaces, utilities)
3. Keep type definitions in `.ts` files
4. Never duplicate type definitions across different files
5. Use proper file organization (types in `types/`, components in `components/`, etc.)

## Logger Instance Missing

### Error
Using logger without initializing the logger instance leads to potential runtime errors or missing logs.

### Root Cause
1. Logger instance needs to be created at module level
2. Each module should have its own logger instance
3. Missing logger import or initialization leads to undefined variable errors
4. Logger name should match module hierarchy for proper log filtering

### Solution
1. Import logging module at the top
2. Create logger instance using `logging.getLogger(__name__)`
3. Place logger initialization before any class or function definitions
4. Use consistent logging levels across the application

### Prevention
When working with Python logging:
1. Always add logger import and initialization at the top of each module
2. Use `__name__` for logger to maintain proper module hierarchy
3. Add logger setup in module template or code snippets
4. Include logging in code review checklist
5. Use static type checkers to catch undefined variables
6. Consider adding a pre-commit hook to check for logger presence

Example pattern for every module:

## Duplicate TypeScript Files with Different Extensions

### Error
Having both `.ts` and `.tsx` files for the same module (e.g., `aiInteraction.ts` and `aiInteraction.tsx`) was not caught during review.

### Root Cause
1. Previous rules didn't explicitly require checking for duplicate files
2. File extension checks were only triggered when actively working on a file
3. Existing files weren't validated against the same rules
4. No automated check for duplicate type definitions

### Solution
1. Add explicit rule to check for duplicate files
2. Always check both `.ts` and `.tsx` versions when working with types
3. Remove incorrect file extension version
4. Add this check to code review process

### Prevention
When working with TypeScript files:
1. Add check for duplicate files to review checklist
2. Use `find` or similar tools to detect duplicate base filenames
3. Implement pre-commit hooks to catch duplicate files
4. Document file extension conventions in project setup
5. Add automated CI checks for duplicate type files

## CI/CD Pipeline Modifications

### Error
Complete rewrite of pipelines without considering existing terraform setup and deployment logic led to potential infrastructure issues and broken deployments.

### Root Cause
1. Overlooked existing terraform configuration and dependencies
2. Removed critical pipeline components (should_run logic, step IDs)
3. Changed working deployment logic without proper validation
4. Missed environment-specific configurations

### Solution
When updating pipelines:
1. Keep existing terraform-related configurations
2. Maintain step IDs for tracking and debugging
3. Keep should_run logic to prevent unnecessary pipeline runs
4. Only update parts directly related to code changes

### Prevention
When modifying CI/CD pipelines:
1. First analyze existing terraform dependencies:
   - Check terraform state handling
   - Verify resource dependencies
   - Maintain deployment order
   - Keep environment configurations

2. Preserve critical pipeline components:
   - Keep step IDs for tracking
   - Maintain should_run logic
   - Keep environment handling
   - Preserve deployment conditions

3. Only update necessary parts:
   - Add new environment variables if needed
   - Update test configurations for new features
   - Add new build steps if required
   - Modify deployment steps only if necessary

4. Document changes:
   - Note why changes were needed
   - Document dependencies
   - Explain environment impacts
   - List affected resources

5. Validate changes:
   - Test in development first
   - Verify terraform state
   - Check resource creation
   - Validate deployments

Example workflow update pattern:

## Firebase Admin SDK Mock Credentials in Tests

### Error
When trying to use mock Firebase Admin SDK credentials in tests, the error "Failed to initialize a certificate credential" occurs because the Firebase Admin SDK requires a specific format for the private key and other credentials.

### Root Cause
1. Mock credentials with invalid private key format cannot be parsed by Firebase Admin SDK
2. Creating mock credentials is error-prone and requires exact format matching
3. Multiple credential setup steps in CI/CD can lead to conflicts and overwrites

### Solution
1. Use actual Firebase Admin SDK credentials from repository secrets in tests
2. Store Firebase credentials as a repository secret (FIREBASE_ADMINSDK_JSON)
3. Apply the same credentials setup in both test and deployment pipelines

### Prevention
When working with Firebase Admin SDK in tests:
1. Never create mock Firebase credentials - use real (test environment) credentials
2. Store Firebase service account JSON as a repository secret
3. Use the same credential setup process across all environments
4. Keep credential setup in a single place in the pipeline
5. Verify credential file creation before running tests

Example pattern:
```yaml
name: Set up Firebase credentials
run: |
mkdir -p app/config
echo '${{ secrets.FIREBASE_ADMINSDK_JSON }}' > app/config/firebase-adminsdk.json
```

## Git Ignore File Management

### Error
Git ignore patterns were added to component-specific .gitignore files instead of the root .gitignore file, leading to inconsistent version control behavior.

### Root Cause
1. Multiple .gitignore files in different directories can cause confusion
2. Component-specific patterns may need to be applied project-wide
3. Lack of centralized version control configuration

### Solution
1. Maintain all git ignore patterns in the root .gitignore file
2. Use proper path prefixes for component-specific patterns
3. Remove unnecessary component-level .gitignore files

### Prevention
When working with git ignore patterns:
1. Always add patterns to the root .gitignore file
2. Use proper path prefixes (e.g., backend/logs/* instead of logs/*)
3. Document ignore patterns with comments
4. Remove component-level .gitignore files unless absolutely necessary
5. Review existing patterns before adding new ones

## API URL Trailing Slash Handling

### Error
Frontend API calls with trailing slashes caused redirect loops (307 redirects) when interacting with FastAPI endpoints.

### Root Cause
1. FastAPI automatically redirects URLs with trailing slashes to non-trailing versions
2. Frontend was sending requests with trailing slashes
3. Each redirect triggered a new request, creating an infinite loop
4. React's strict mode and development features amplified the issue

### Solution
1. Remove trailing slashes from frontend API calls
2. Keep consistent URL patterns across the application
3. Update API documentation to clarify URL format
4. Add logging to track redirect issues

### Prevention
When working with FastAPI and frontend API calls:
1. Never use trailing slashes in API URLs from frontend
2. Document URL format requirements in API documentation
3. Add logging for redirect responses
4. Consider disabling FastAPI's automatic redirects if not needed
5. Add URL format validation in frontend API calls

## Import Ordering

To maintain consistent import ordering across the codebase:
1. Standard library imports
2. Third party imports
3. First party imports (from app.*)

This is enforced by isort and pylint configurations in pyproject.toml.

## Jest Environment Web APIs

### Error
When using Firebase Auth in Jest tests, errors like "TextEncoder is not defined" or "ReadableStream is not defined" occur because Node.js environment lacks web APIs.

### Root Cause
1. Jest runs in Node.js environment which doesn't have web APIs by default
2. Firebase Auth requires web APIs like TextEncoder and ReadableStream
3. JSDOM provides some web APIs but not all
4. Mixing Node.js and web APIs can cause type conflicts

### Solution
1. Use JSDOM's built-in web APIs where available (Blob, FormData)
2. Import Node.js implementations for missing APIs (ReadableStream)
3. Create proper type definitions for global objects
4. Use custom wrapper classes to handle type incompatibilities

### Prevention
When setting up Jest with web APIs:
1. Always check which APIs are provided by JSDOM
2. Create proper type definitions in a separate .d.ts file
3. Use custom wrapper classes for incompatible APIs
4. Document web API requirements in test setup
5. Consider using web-streams-polyfill for better compatibility

Example pattern:
```typescript
// In test-env.d.ts
declare global {
  var TextEncoder: {
    new (): TextEncoder;
    prototype: TextEncoder;
  };
}

// In jest.setup.ts
import { TextEncoder as NodeTextEncoder } from 'util';

class CustomTextEncoder extends NodeTextEncoder {
  encode(input?: string): Uint8Array {
    return super.encode(input);
  }
}

global.TextEncoder = CustomTextEncoder as any;
```

## Jest Environment and Import.meta Resolution

### Error
When testing modules that use `import.meta.env`, Jest tests fail with: