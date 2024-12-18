# Comprehensive AI Ruleset for Full-Stack Development and Workflow

## 1. General AI Rules
- **Consistency**: Always adhere to previously defined architectural decisions, coding standards, and testing strategies.
- **Explain Reasoning**: Provide a step-by-step explanation of your reasoning for every architectural decision, code generation, or change.
- **Error Awareness**: When encountering issues, reference the learnings markdown to avoid repeating known mistakes and document new resolutions.
- **Validation**: Every output must pass automated linting, unit tests, and integration tests before being finalized. Use the validation checklist below for consistent application.
- **Changelog Management**: Update the changelog markdown with details of each session’s changes, including reasoning and expected outcomes.

### Validation Checklist:
- [ ] Does the output align with the architectural trace markdown?
- [ ] Does the output address any known issues documented in the learnings markdown?
- [ ] Has the output been linted and passed all automated tests?
- [ ] Are security considerations explicitly addressed (e.g., sanitizing inputs, securing tokens)?

## 2. Automated Updates and Traceability
- **Learnings Markdown**:
  - Record all newly discovered pitfalls and their resolutions.
  - Update with every session to include relevant examples and improvements.
  - Timestamp updates with session or commit IDs for traceability.

- **Architectural Trace Markdown**:
  - Maintain a persistent record of architectural decisions and reasoning for new components or changes.
  - Include diagrams or pseudocode summaries when appropriate.

- **Commit Changelog Markdown**:
  - Log every session's changes, including files modified, rationale, and impact on existing systems.

## 3. Quality Gate: Automated Review and Validation
- **Validation Rules**:
  - All code must pass the following before being finalized:
    - Linting: `eslint` for TypeScript, `black` and `flake8` for Python.
    - Testing: `jest` for frontend, `pytest` for backend with >85% coverage.
    - Deployment: Ensure infrastructure changes (Terraform) are validated via `terraform plan` before apply.
  - If errors are detected, apply auto-fixes where possible, then re-validate.

- **Security Validation Checklist**:
  - [ ] Are sensitive tokens, keys, or credentials excluded from the codebase?
  - [ ] Are API tokens scoped with least privilege?
  - [ ] Are secure defaults (e.g., HTTPS, SameSite cookies) enforced?
  - [ ] Are inputs validated to prevent injection attacks?

## 4. Frontend Rules (TypeScript / React / S3 + CloudFront)
- **Development**:
  - Use TypeScript with strict mode enabled.
  - Structure components with separation of concerns (e.g., `components/`, `hooks/`, `utils/`).
  - Use OAuth2 PKCE flow for Google Authentication.
  - Store tokens securely (e.g., HTTP-only, SameSite cookies).

- **Testing**:
  - Unit tests using `jest` with >85% coverage.
  - Integration tests using `Cypress` for API interaction validation.
  - Mock all sensitive external services (e.g., Google Auth, Firebase) to avoid exposing keys or impacting live systems.

- **Deployment**:
  - Serve via S3 with CloudFront, enabling caching and compression.
  - Ensure cache invalidation on deployment.
  - Always verify the origin of API requests to mitigate CSRF attacks.

## 5. Backend Rules (Python Flask API / Poetry / AWS Lambda)
- **Development**:
  - Use `poetry` for dependency management and isolate environments.
  - Follow modular design principles for scalability and maintainability.

- **Testing**:
  - Use `pytest` with mocking libraries (`moto`, `pytest-mock`) for unit tests.
  - Validate API endpoints with integration tests using `httpx`.
  - Validate token expiration and implement revocation to prevent misuse.

- **Deployment**:
  - Deploy via AWS Lambda behind API Gateway v2, ensuring optimized cold start performance.
  - Use structured logging (e.g., JSON format) and integrate with AWS CloudWatch Logs.

- **Input Validation Rules**:
  - Sanitize all inputs before processing.
  - Validate request payloads using JSON schemas or similar techniques.
  - Reject requests with unexpected fields or invalid formats.

## 6. IaC Rules (Terraform on AWS)
- **Structure**:
  - Use modular architecture with reusable components (e.g., `s3/`, `cloudfront/`, `lambda/`).

- **Validation**:
  - Perform `terraform fmt` and `terraform validate` on every plan.
  - Run `terraform plan` with cost estimation enabled and review outputs for unexpected resource creation or deletion.

- **Security**:
  - Use IAM policies with the principle of least privilege.
  - Avoid wildcards (`*`) in resource or action definitions.
  - Rotate IAM keys regularly and use role-based access.

- **Environment Isolation**:
  - Deploy separate AWS accounts for production and development environments to ensure resource isolation and mitigate accidental misconfigurations.

## 7. Google/Firebase Authentication and Token Handling
- **Frontend**:
  - Use libraries like `@react-oauth/google` for Google sign-in.
  - Request tokens with the least privilege scopes (e.g., `openid`, `profile`, `email`).
  - Store tokens in HTTP-only, SameSite cookies.

- **Backend**:
  - Verify Google ID tokens with `google.oauth2.id_token`.
  - Use Firebase Admin SDK for token validation and custom claims management.
  - Store refresh tokens securely using encryption.
  - Rotate refresh tokens regularly and expire long-unused tokens automatically.

## 8. Debug Logging and Analysis
- **Local**:
  - Write logs to a file with debug-level granularity.

- **AWS**:
  - Use CloudWatch Logs for scalable log storage and analysis.
  - Export logs to S3 for cost-effective, long-term storage and analysis.

- **Structured Logging**:
  - Use JSON log formats for consistency and machine-readability.
  - Avoid sensitive data (e.g., tokens, PII) in logs. Use hashing or anonymization where necessary.

## 9. GitHub Actions Workflow
- **Frontend**:
  - Run linting, unit tests, build, and deployment pipelines.
  - Include secret scanning and dependency vulnerability checks.

- **Backend**:
  - Validate dependencies, run tests, package Lambda functions, and deploy.
  - Use ephemeral environments (e.g., AWS Ephemeral Instances or Docker containers) for isolated tests.

- **IaC**:
  - Ensure Terraform validation and apply only after approval.
  - Use pre-deployment checks to validate infrastructure changes.

---

## Example Workflow for AI Outputs

### 1. Initial Proposal
1. Write down reasoning and strategies in the architectural trace markdown.
2. Reference learnings markdown for previous pitfalls and resolutions.

### 2. Validation
1. Automatically validate the generated code using linters and test suites.
2. If errors are found, apply auto-fixes and re-run validations.

### 3. Finalization
1. Update learnings markdown, architectural trace, and changelog markdowns.
2. Submit validated code for integration.
