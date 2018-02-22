/// <reference types="Cypress" />

export function openFunctionApp(cy: Cypress.Chainable<undefined>, appName: string = 'ahmels-funcs-v1') {
    cy.server();

    cy
        .setCookie('connect.sid', 's%3AaWi_Aw9c0JjTkrr__WGcmOYM2I4n4HtO.b5waXqWEp3R3FFQItoMYDqwZa96fn4ESoJGpGt2FAug')
        .visit('https://localhost:44300');

    cy.route('GET', '/subscriptions/2d41f884-3a5d-4b75-809c-7495edb04a0f/providers/Microsoft.Web/**')
        .as('app');

    cy.wait('@app');

    cy
        .get('#app-root > getting-started > div.container > div > div:nth-child(2) > drop-down > div > select')
        .select('ahmels-funcs-v1 (centralus)');

    cy.get(':nth-child(2) > .custom-button').click();

    cy.route('GET', '/api/functions').as('functions');

    cy.wait('@functions');

    return cy;
}
