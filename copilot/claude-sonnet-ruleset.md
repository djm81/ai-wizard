# AI Code Assistant Rules

## Core Principles
C1. Analyze issues systematically with root cause analysis
C2. Propose clear solutions with explanations
C3. Follow language-specific best practices and patterns
C4. Maintain clean code (no deprecated code, unused imports, proper docstrings)
C5. Document all significant changes
C6. Validate changes against existing tests and linting rules
C7. Preserve existing identifiers and comments to maintain context

## Response Format
Every response must follow this structure:

1. Analysis Phase
   - Identify affected components and files
   - List applicable rules from each relevant section
   - Document potential impacts and dependencies

   Example:
   ```
   📁 Affected Components:
   - backend/app/api/endpoints/projects.py
   - backend/app/services/project_service.py

   📋 Applicable Rules:
   Primary Rules:
   ✓ S1: Authentication flows (Security)
   ✓ E9: HTTP status codes (Error Handling)
   ⚠️ RC1: Rule conflict detected

   Supporting Rules:
   ℹ️ B1: FastAPI patterns
   ℹ️ D1: SQLAlchemy patterns
   ℹ️ P2: Code preservation
   ```

2. Solution Design
   - Propose specific changes with rationale
   - Reference relevant rules for each change
   - Include code snippets with file paths

   Example:
   ```
   💡 Proposed Changes:
   1. ✨ Update error handling (E9, S1)
   2. 🔒 Improve auth flow (S1, S3)
   3. ⚠️ Preserve debug code (P1)

   ❓ Clarification needed:
   - Confirm if debug logging should be kept (P1 vs Q1)
   ```

3. Implementation Details
   - Provide code changes with file paths
   - Include comments referencing rules
   - Document any assumptions

   Example:
   ```python:backend/app/api/endpoints/projects.py
   @router.get("/{project_id}")  # ✓ A1: RESTful convention
   async def get_project(
       project_id: int,
       current_user: User = Depends(get_current_user)  # ✓ S1: Auth flow
   ):
       try:
           # ✓ E1: Error handling
           project = await project_service.get_project(project_id)
       except ProjectNotFound as e:
           # ✓ E3: Error context
           logger.error("Project %s not found", project_id, exc_info=e)
           raise HTTPException(status_code=404, detail="Project not found")
   ```

4. Validation Checklist
   - Confirm all applicable rules are followed
   - Verify test coverage (V1)
   - Check security implications (S1-S8)
   - Validate error handling (E1-E8)
   - Check code preservation (P1-P5)
   - Verify rule conflicts (RC1-RC4)

   Example:
   ```
   ✅ Security:
   - ✓ S1: Authentication implemented
   - ✓ S3: Sensitive data handled
   - ⚠️ S4: CORS needs review

   ✅ Error Handling:
   - ✓ E1: Consistent patterns
   - ✓ E9: Proper status codes
   - ℹ️ E3: Added context

   ✅ Code Preservation:
   - ✓ P1: Comments preserved
   - ✓ P2: No premature optimization
   - ⚠️ P4: Technical debt documented

   ✅ Rule Conflicts:
   - ❓ RC1: Q1 vs P2 (keeping debug code)
   - ✓ RC2: Priority order followed
   - ✓ RC3: Override documented

   ❌ Breaking Changes:
   - None identified

   ❓ Open Questions:
   - Confirm CORS configuration
   ```

5. Documentation Updates
   - Note required README changes (D1)
   - Update .uncommitted_changes (D3)
   - Document any learnings (D2)
   - Technical debt documented in .learnings
   - Rule override documented

   Example:
   ```
   📝 Documentation Updates:
   ✓ README.md updated with new endpoint
   ✓ .uncommitted_changes updated
   ✓ Technical debt documented in .learnings
   ℹ️ Added error handling pattern to .learnings
   ⚠️ Rule override documented
   ```

6. Final Confirmation
   - "**✅ AI Rules Applied**" confirmation
   - "**📝 Changelog Updated**" if applicable
   - List any pending items or follow-ups
   - Code preservation verified
   - Rule conflicts resolved

   Example:
   ```
   ✅ AI Rules Applied
   📝 Changelog Updated
   ✓ Code Preservation Verified
   ✓ Rule Conflicts Resolved

   ⚠️ Follow-ups:
   1. Review CORS settings
   2. Add integration tests
   3. Document preserved code rationale
   4. Review technical debt items
   ```

Icon Legend:
✅ Passed/Completed
❌ Failed/Missing
⚠️ Warning/Needs Attention
ℹ️ Information
❓ Question/Needs Clarification
📁 File/Component
📋 List/Rules
💡 Suggestion
✨ New Feature/Change
🔒 Security Related
📝 Documentation

## Code Quality Standards
Q1. Remove all unused code, imports, and variables
    - Remove unreachable/dead code blocks
    - Remove code that can never be executed
    - Document removal of any significant code blocks
Q2. Fix linting errors in proposed code changes
Q3. Ensure proper error handling and logging
Q4. Add/update docstrings for new/modified functions
Q5. Check for and remove duplicate files (especially .ts vs .tsx)
Q6. Follow project-specific naming conventions
Q7. Ensure code changes are properly tested
Q8. Maintain existing decision comments and rationale

## Frontend Development (React/TypeScript)
F1. Follow React hooks and functional component patterns
F2. Implement Firebase auth token handling
   - Use "Bearer mock-token" for testing
   - Mock Firebase/Google auth calls in tests
F3. Maintain type safety with proper TypeScript definitions
F4. Update frontend CI/CD pipeline when needed
F5. Ensure components are properly tested

## Backend Development (FastAPI/Python)
B1. Follow FastAPI patterns and best practices
B2. Use SQLAlchemy ORM patterns correctly
B3. Implement pytest fixtures and patterns for testing
B4. Handle async operations properly
B5. Mock Firebase Auth in tests
   - Use "Bearer mock-token" for testing
   - Mock Firebase Admin SDK calls
B6. Use in-memory database for testing
B7. Update backend CI/CD pipeline when needed

## Infrastructure (Terraform)
T1. Prevent infrastructure drift
T2. Check for resource duplicates
T3. Include required tags (Service, Name) on resources
T4. Validate terraform code before applying
T5. Use variables from .tfvars files in pipelines
T6. Ensure complete variable assignments in pipeline steps
T7. Ensure directories are inside or below module directory when referencing files

## CloudFormation
CF1. Follow AWS CloudFormation best practices
CF2. Use proper IAM least privilege principles
CF3. Include required tags on resources
    - Service
    - Name
    - Environment
CF4. Validate templates before deployment
    - Use cfn-lint for validation
    - Check for circular dependencies
CF5. Maintain existing stack parameters and conditions
CF6. Document all custom resources
CF7. Include proper deletion policies
CF8. Use cross-stack references where appropriate

## GitHub Workflows
W1. Preserve existing workflow structure and comments
W2. Maintain workflow identifiers and step names
W3. Follow GitHub Actions best practices
    - Use specific version pins for actions
    - Implement proper error handling
    - Add timeout limits
W4. Include proper environment variables
W5. Implement proper secret handling
W6. Add appropriate workflow triggers
W7. Maintain existing conditional logic
W8. Document complex workflow steps
W9. Implement proper job dependencies
W10. Include proper cleanup steps
W11. Ensure working directory and relative paths are correct in pipeline steps

## Documentation & Change Management
D1. Update README.md for significant changes
   - Include setup instructions
   - Document new dependencies
   - Update deployment steps
D2. Document error learnings in .learnings file
D3. Track changes in .uncommitted_changes file
   - Create file if not exists
   - Update summary line
   - Add detailed change descriptions
D4. Mark completed reviews with "**AI Rules Applied**"
D5. Confirm changelog updates with "**Changelog updated**"

## Testing & Validation
V1. Ensure test coverage for new code
V2. Validate API endpoints and authentication
V3. Check for breaking changes
V4. Verify pipeline configurations
V5. Test resource cleanup
V6. Validate error handling

## Database Management
D1. Follow SQLAlchemy relationship patterns
    - Use proper cascade settings
    - Define clear foreign key relationships
D2. Implement proper database migrations
D3. Handle database transactions correctly
D4. Use appropriate indexing strategies
D5. Implement proper connection pooling
D6. Handle database errors gracefully
D7. Use appropriate session management
D8. Follow naming conventions for database objects

## API Design
A1. Follow RESTful API conventions
A2. Implement proper request/response schemas
A3. Use consistent error response formats
A4. Include proper API documentation
    - OpenAPI/Swagger specifications
    - Example requests/responses
A5. Implement proper versioning
A6. Handle rate limiting appropriately
A7. Implement proper pagination
A8. Use consistent endpoint naming

## Security
S1. Implement proper authentication flows
S2. Follow authorization best practices
S3. Handle sensitive data appropriately
    - API keys
    - Tokens
    - User credentials
S4. Implement proper CORS policies
S5. Follow secure coding practices
S6. Implement proper input validation
S7. Handle security headers correctly
S8. Follow least privilege principle

## Error Handling & Logging
E1. Implement consistent error handling patterns
E2. Use proper logging levels
    - DEBUG for development details
    - INFO for normal operations
    - WARNING for potential issues
    - ERROR for failures
E3. Include proper error context
E4. Implement proper error recovery
E5. Use structured logging format
E6. Handle async operation errors
E7. Implement proper error boundaries
E8. Follow error documentation standards
E9. Maintain proper HTTP status codes
    - 400 for client validation errors
    - 401/403 for authentication/authorization errors
    - 404 for not found
    - 500 for unexpected server errors
    - Never expose 500 errors for validation failures
    - Pass through FastAPI HTTP exceptions with original status codes
E10. Include appropriate error context in responses
    - User-friendly messages for client errors
    - Generic messages for server errors
    - Maintain security by not exposing internal details

## State Management
M1. Follow consistent state management patterns
M2. Implement proper loading states
M3. Handle error states appropriately
M4. Implement proper data caching
M5. Handle component lifecycle correctly
M6. Implement proper cleanup
M7. Follow state immutability patterns
M8. Use appropriate state management tools

## Security Testing & Validation
ST1. Analyze cryptographic requirements
    - Identify components requiring real credentials
    - Check for cryptographic validation requirements
    - Document which components can't be mocked
ST2. Validate security component mocking
    - Test if security components accept mock data
    - Verify cryptographic validation requirements
    - Document failed mock attempts in .learnings
ST3. Handle sensitive credentials in CI/CD
    - Use GitHub secrets for real credentials
    - Never mock cryptographically validated credentials
    - Implement proper secret rotation
ST4. Test security boundaries
    - Validate authentication flows
    - Test authorization boundaries
    - Verify token validation
ST5. Document security testing requirements
    - List required real credentials
    - Specify mock limitations
    - Include setup instructions
ST6. Implement proper test isolation
    - Separate security critical tests
    - Use dedicated test credentials
    - Maintain test environment security

## Code Preservation Guidelines
P1. Preserve existing code comments and documentation
    - Keep decision comments explaining "why" something was done
    - Maintain TODO comments for future work
    - Preserve debugging helpers and tools
P2. Avoid premature optimization
    - Don't remove code that might serve a future purpose
    - Keep backward compatibility layers unless explicitly requested
    - Maintain diagnostic and debugging capabilities
P3. Document preservation decisions
    - Note why certain "unused" code was kept
    - Reference related issues or future requirements
    - Mark intentionally preserved code sections
P4. Handle technical debt carefully
    - Don't remove workarounds without understanding their purpose
    - Document known technical debt
    - Keep fallback implementations until new solutions are proven
P5. Preserve test support code
    - Keep test utilities even if currently unused
    - Maintain debugging helpers in tests
    - Preserve test data generators

## Rule Conflict Resolution
RC1. Identify conflicting rules
    - List all rules that conflict with the current request
    - Explain the nature of each conflict
    - Document potential impacts
RC2. Conflict resolution priority
    1. Security rules (S1-S8) always take precedence
    2. Data integrity rules (D1-D8) come second
    3. Error handling rules (E1-E10) are third
    4. Other rules follow based on context
RC3. Document override decisions
    - Note which rule was overridden and why
    - Document the temporary nature of overrides
    - Reference the authorizing prompt
RC4. Example conflict report format:
    ```
    Rule Conflict Detected:
    - Conflicting Rules: Q1 (Remove unused code) vs P2 (Avoid premature optimization)
    - Context: Unused but documented fallback implementation
    - Recommendation: Keep code (P2 takes precedence)
    - Rationale: Code serves as documented fallback mechanism
    - Override Required: No
    ```
