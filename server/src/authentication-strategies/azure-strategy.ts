
import { Request, Response, NextFunction, Application } from "express";
import { constants as _constants } from "../constants";
import constants = _constants.authentication;

export namespace azureStrategy {
    export function authenticate(req: Request, res: Response, next: NextFunction) {
        const displayName = req.header(constants.frontEndDisplayNameHeader) || '';
        const principalName = req.header(constants.frontEndPrincipalNameHeader) || '';
        const portalToken = req.header(constants.portalTokenHeader) || '';

        if (portalToken) {
            req.user = {
                token: portalToken
            };
        } else if (principalName.toLocaleLowerCase() === constants.anonymousUserName) {
            if (req.xhr) {
                res.status(401).send('authorization token missing');
                return;
            }
        } else {
            req.user = {
                token: ''
            };
        }

        next();
    }

    export function maybeAuthenticate(req: Request, res: Response, next: NextFunction) {

    }
}