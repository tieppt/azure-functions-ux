
import { Request, Response, NextFunction, Application } from "express";
import { constants as _constants } from "../constants";
import constants = _constants.authentication;

export namespace azureStrategy {
    export function authenticate(req: Request, res: Response, next: NextFunction) {
        internalAuthenticate(req, res, false, next);
    }

    export function maybeAuthenticate(req: Request, res: Response, next: NextFunction) {
        internalAuthenticate(req, res, true, next);
    }

    function internalAuthenticate(req: Request, res: Response, allowAnonymous: boolean, next: NextFunction) {
        const displayName = req.header(constants.frontEndDisplayNameHeader) || '';
        const principalName = req.header(constants.frontEndPrincipalNameHeader) || '';
        const portalToken = req.header(constants.portalTokenHeader) || '';
        const authToken = req.header(constants.authorizationHeader) || '';

        if (portalToken) {
            req.user = {
                token: portalToken
            };
        } else if (authToken) {
            req.user = {
                token: portalToken
            };
        } else if (allowAnonymous) {
            req.user = {
                token: constants.anonymousUserName
            };
        } else {
            if (req.xhr) {
                res.status(401).send('authorization token missing');
            } else {
                // we should probably redirect to the app setting for the acom thing
                res.redirect('/signin');
            }
            return;
        }
        // TODO: validate.
        next();
    }
}