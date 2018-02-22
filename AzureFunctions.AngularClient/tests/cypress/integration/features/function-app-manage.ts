/// <reference types="Cypress" />
import { openFunctionApp } from '../../fixtures/features/function-app-view';

describe('Testing function app management operations', () => {
    before(() => {
        openFunctionApp(cy);
    });

    it('should have all the commands working', () => {
        cy
            .get('#site-tab-content-overview > site-summary > command-bar > div > command:nth-child(1) > a')
            .should('not.be.disabled')
            .should(e => {
                expect(e.text()).to.contain('Stop');
            });

        cy.get('[iconurl="image/swap.svg"] > .list-item').should('not.be.disabled');
        cy.get('[iconurl="image/restart.svg"] > .list-item').should('not.be.disabled');
        cy.get('[ng-reflect-display-text="Download publish profile"] > .list-item').should('not.be.disabled');
        cy.get('[iconurl="image/reset.svg"] > .list-item').should('not.be.disabled');
        cy.get('[ng-reflect-display-text="Download app content"] > .list-item').should('not.be.disabled');
        cy.get('[iconurl="image/delete.svg"] > .list-item').should('not.be.disabled');
    });

    it('should have configured featured', () => {
        cy
            .get('#site-summary-features > site-enabled-features > div:nth-child(2) > div:nth-child(1)')
            .should(e => expect(e.text()).to.contain('Function app settings'));

        cy
            .get('#site-summary-features > site-enabled-features > div:nth-child(2) > div:nth-child(2)')
            .should(e => expect(e.text()).to.contain('Application settings'));
    });
});
