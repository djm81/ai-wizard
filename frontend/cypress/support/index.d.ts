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
