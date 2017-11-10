
import { Request, Response, NextFunction, Application } from 'express';
import { localhostStrategy } from './authentication-strategies/localhost-strategy';
import { azureStrategy } from './authentication-strategies/azure-strategy';


export function setupAuthentication(app: Application) {
    const localhost = true;
    if (localhost) {
        localhostStrategy.setup(app);
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const localhost = true;
    if (localhost) {
        localhostStrategy.authenticate(req, res, next);
    } else {
        azureStrategy.authenticate(req, res, next);
    }
}

export function maybeAuthenticate(req: Request, res: Response, next: NextFunction) {
    const localhost = true;
    if (localhost) {
        localhostStrategy.maybeAuthenticate(req, res, next);
    } else {
        azureStrategy.maybeAuthenticate(req, res, next);
    }
}