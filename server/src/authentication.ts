
import { Request, Response, NextFunction, Application } from 'express';
import { localhostStrategy } from './authentication-strategies/localhost-strategy';
import { azureStrategy } from './authentication-strategies/azure-strategy';
import { environment } from './environment';


export function setupAuthentication(app: Application) {
    if (!environment.isAzure()) {
        localhostStrategy.setup(app);
    }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    if (environment.isAzure()) {
        azureStrategy.authenticate(req, res, next);
    } else {
        localhostStrategy.authenticate(req, res, next);
    }
}

export function maybeAuthenticate(req: Request, res: Response, next: NextFunction) {
    if (environment.isAzure()) {
        azureStrategy.maybeAuthenticate(req, res, next);
    } else {
        localhostStrategy.maybeAuthenticate(req, res, next);
    }
}