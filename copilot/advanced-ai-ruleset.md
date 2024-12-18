# Advanced AI Assistant Ruleset

## Core Requirements

### Mandatory Artifacts
1. **Changelog Updates** (.uncommitted_changes)
   - Single-line summary (git commit style)
   - Detailed change breakdown
   - Modified files and impact
   - Validation status

2. **Chain-of-Thought Documentation** (chain-of-thought.md)
   - Architectural decisions
   - Pattern evolution
   - Implementation rationale
   - Success checkpoints
   - Pipeline validations

3. **Learnings Documentation** (learnings.md)
   - Error patterns
   - Resolution strategies
   - Prevention measures
   - Context preservation

### Validation Requirements
1. **Code Quality**
   - Linting compliance
   - Type safety
   - Test coverage
   - Performance metrics

2. **Security**
   - Authentication/Authorization
   - Data protection
   - API security
   - Infrastructure safety

## Response Structure

### 1. Context Analysis
```
📋 Requirements Analysis:
- Business objectives
- Technical constraints
- Security implications

🔍 Impact Assessment:
- Affected components
- Breaking changes
- Dependencies

⚠️ Risk Analysis:
- Security considerations
- Performance impact
- Scalability concerns
```

### 2. Solution Architecture
```
💡 Design Decisions:
- Pattern selection
- Technology choices
- Trade-off analysis

🏗️ Implementation Strategy:
- Component breakdown
- Integration approach
- Testing strategy

❓ Clarification Needs:
- Open questions
- Assumption validation
- Dependency conflicts
```

### 3. Implementation Plan
```
📝 Code Changes:
- File modifications
- New components
- Migration steps

✅ Validation Steps:
- Unit tests
- Integration tests
- Security checks
- Performance validation

📚 Documentation Updates:
- API documentation
- Architecture docs
- Deployment guides
```

### 4. Quality Gates
```
🔒 Security Validation:
- Authentication flows
- Authorization rules
- Data protection
- API security

🧪 Test Coverage:
- Unit test status
- Integration test results
- E2E validation
- Performance metrics

📋 Documentation:
- Technical documentation
- API documentation
- Deployment guides
- Change records
```

## Error Prevention Protocol

### 1. Pre-Implementation Checks
- Review learnings.md for known issues
- Validate architectural decisions
- Confirm pattern compatibility
- Check security implications

### 2. Implementation Safeguards
- Type safety enforcement
- Error boundary implementation
- Proper error handling
- Logging strategy

### 3. Post-Implementation Validation
- Test coverage verification
- Performance benchmarking
- Security scanning
- Documentation completeness

## Conflict Resolution

### 1. Priority Order
1. Security requirements
2. Data integrity
3. System stability
4. Performance
5. Developer experience

### 2. Resolution Process
1. Identify conflicting requirements
2. Document trade-offs
3. Present options to user
4. Implement chosen solution
5. Document decision rationale

## Final Validation Checklist

```
✅ Code Quality
- [ ] Linting passed
- [ ] Types validated
- [ ] Tests passing
- [ ] Performance verified

✅ Security
- [ ] Authentication verified
- [ ] Authorization checked
- [ ] Data protection confirmed
- [ ] API security validated

✅ Documentation
- [ ] Chain-of-thought updated
- [ ] Changelog created
- [ ] API docs updated
- [ ] Learnings documented

❌ Breaking Changes
- List any breaking changes
- Migration steps documented

⚠️ Follow-up Items
- Outstanding tasks
- Future improvements
- Known limitations
```

## Artifact Updates

### 1. Changelog Requirements
- Clear summary line
- Detailed change list
- Impact assessment
- Validation status

### 2. Chain-of-Thought Updates
- Decision documentation
- Pattern evolution
- Implementation rationale
- Success checkpoints

### 3. Learnings Documentation
- Error patterns
- Resolution strategies
- Prevention measures
- Context preservation

## Environment-Specific Rules

### Frontend (React/TypeScript)
F1. React hooks and functional patterns
F2. TypeScript strict mode
F3. Component architecture
F4. State management
F5. Authentication flows
F6. Testing requirements
F7. Build optimization
F8. Security considerations

### Backend (FastAPI/Python)
B1. FastAPI best practices
B2. Database patterns
B3. Authentication/Authorization
B4. API design
B5. Error handling
B6. Testing strategy
B7. Performance optimization
B8. Security measures

### Infrastructure (AWS/Terraform)
T1. Infrastructure as Code practices
T2. Resource management
T3. Security configurations
T4. Deployment strategies
T5. Monitoring setup
T6. Cost optimization
T7. Compliance requirements
T8. Disaster recovery

## Security Rules
S1. Authentication implementation
S2. Authorization patterns
S3. Data protection
S4. API security
S5. Infrastructure security
S6. Compliance requirements
S7. Security testing
S8. Incident response

## Testing & Validation
V1. Unit testing
V2. Integration testing
V3. End-to-end testing
V4. Security testing
V5. Performance testing
V6. Accessibility testing
V7. Cross-browser testing
V8. Mobile responsiveness

## Documentation Requirements
D1. Code documentation
D2. API documentation
D3. Architecture documentation
D4. Security documentation
D5. Deployment documentation
D6. Testing documentation
D7. User documentation
D8. Maintenance documentation

## Error Handling
E1. Error patterns
E2. Logging standards
E3. Monitoring setup
E4. Alert configuration
E5. Recovery procedures
E6. User feedback
E7. Debug information
E8. Error tracking

## Code Quality Standards
Q1. Code style
Q2. Performance
Q3. Maintainability
Q4. Scalability
Q5. Reliability
Q6. Reusability
Q7. Testability
Q8. Documentation

## Workflow Integration
W1. Version control
W2. CI/CD pipelines
W3. Code review
W4. Release management
W5. Environment management
W6. Monitoring
W7. Alerting
W8. Incident response

## Icon Legend
✅ Passed/Completed
❌ Failed/Missing
⚠️ Warning/Attention Needed
ℹ️ Information
❓ Question/Clarification
📁 File/Component
📋 List/Rules
💡 Suggestion
✨ New Feature
🔒 Security Related
📝 Documentation

## Rule Conflict Resolution
RC1. Security > Performance
RC2. Reliability > Optimization
RC3. Maintainability > Complexity
RC4. Documentation > Speed
RC5. Testing > Delivery
RC6. User Experience > Technical Elegance
RC7. Stability > Innovation
RC8. Standards > Customization

## Final Validation
Every AI response must end with:

```
✅ AI Rules Applied
📝 Documentation Updated
✓ Security Validated
✓ Tests Confirmed
✓ Performance Verified

⚠️ Follow-up Items:
1. [List items]
2. [List items]
```
