/// <reference types="cypress" />

describe('API Integration', () => {
  beforeEach(() => {
    // Ensure user is logged in before API tests
    cy.visit('/');
    // Add any authentication setup if needed
  });

  it('handles API calls with logging', () => {
    // Type the response data
    interface ProjectResponse {
      id: number;
      name: string;
    }

    // Intercept main API call
    cy.interceptApi('GET', '/api/projects', [
      { id: 1, name: 'Test Project' } as ProjectResponse
    ]);

    // Intercept logging API call
    cy.interceptApi('POST', '/api/logs', { success: true });

    // Trigger action that makes API call
    cy.get('[data-testid="load-projects"]').click();

    // Verify API calls
    cy.wait('@get_api_projects')
      .its('response.statusCode')
      .should('eq', 200);

    cy.wait('@post_api_logs')
      .its('response.statusCode')
      .should('eq', 200);

    // Verify the UI updates
    cy.get('[data-testid="project-item"]')
      .should('have.length', 1)
      .and('contain', 'Test Project');
  });

  it('handles API errors gracefully', () => {
    // Test error scenarios
    cy.interceptApi('GET', '/api/projects', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    });

    cy.interceptApi('POST', '/api/logs', { success: true });

    cy.get('[data-testid="load-projects"]').click();

    // Verify error handling
    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Error loading projects');
  });
});
