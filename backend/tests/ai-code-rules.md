Code generation and review / testing rules:
1. Analyze the most likely root cause and source for each error step by step
2. Propose fix, if not exactly clear, ask what is the expected behavior here
3. We use firebase auth and expect a valid token, so eventually we need to mock some api calls if they would be fired towards firebase or google auth for token validation
4. In frontend for testing we use "Bearer mock-token" as test-token, where "mock-token" is the value of the Bearer token, so we could use this validation value, if required
5. Ensure that our api incl. authentication (and mocks) has matching values and endpoints as well as their basic implementation at least.
6. We use pytest, so tests should be created using pytest fixtures and syntax.
7. We use FastAPI, so we need to follow its patterns and syntax.
8. We use SQLAlchemy, so we need to follow its patterns and syntax.
9. We use Pytest, so we need to follow its patterns and syntax.
10. Ensure, that we have no deprecated code, missing docstrings, unused imports etc.
11. Expect the api token from frontend to be async (javascript/typescript) and use "Bearer mock-token" as test-token, where "mock-token" is the value of the Bearer token, so we could use this validation value, if required
12. As we use Firebase Auth, we need to mock the auth validation, so we need to mock the firebase auth api and admin sdk api calls, if used in our api
13. In test mode, we have no real database, so we need to use the in-memory database, which is already set up in conftest.py
