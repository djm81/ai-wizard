/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    /**
     * Custom command to intercept API calls with logging
     * @example cy.interceptApi('GET', '/api/projects', mockResponse)
     */
    interceptApi(
      method: string,
      path: string,
      response: any
    ): Chainable<null>;
  }
}

// Custom command implementation
Cypress.Commands.add('interceptApi', (method: string, path: string, response: any) => {
  return cy.intercept(
    {
      method,
      url: `${Cypress.env('apiUrl')}${path}`,
    },
    response
  ).as(`${method.toLowerCase()}${path.replace(/\//g, '_')}`);
});
