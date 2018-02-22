import { Request, Response, NextFunction, Application } from 'express';
import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';
import * as uuid4 from 'uuid/v4';
import { staticConfig } from '../config';
import { constants } from "../constants";
//import * as strategy from 'passport-azure-ad-oauth2';
const strategy = require('passport-azure-ad-oauth2');

import { User, Token } from './user';

export function setupAuthentication(app: Application) {
    passport.use(authStrategy());
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);

    app.get('/.login',
        passport.authenticate('azure_ad_oauth2', { failureRedirect: '/.login/error', }),
        (_, res) => {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    app.get('/manage',
        passport.authenticate('azure_ad_oauth2', { failureRedirect: '/.login/error' }),
        (_, res) => {
            // Successful authentication, redirect home.
            res.redirect('/');
        });

    app.get('/.login/error', (_, res) => {
        res.status(500).send('There was an error in login');
    });
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/.login');
}

export function maybeAuthenticate(_: Request, __: Response, next: NextFunction) {
    return next();
    // if (req.isAuthenticated()) {
    //     return next();
    // }
    // res.redirect('/.login');
}

export function getTenants(req: Request, res: Response) {
    const user = req.user as User;
    if (req.host === 'localhost') {
        const headers = {
            'Authorization': `Bearer ${user.token.access_token}`
        };

        axios.get(`${staticConfig.config.env.azureResourceManagerEndpoint}/tenants?api-version=2017-06-01`, { headers: headers })
            .then(r => {
                const tenants = r.data
                    .value
                    .map((t: { tenantId: string }) => ({
                        DisplayName: t.tenantId,
                        DomainName: t.tenantId,
                        TenantId: t.tenantId,
                        Current: t.tenantId.toUpperCase() === user.tid.toUpperCase()
                    }));
                res.json(tenants);
            })
            .catch(err => res.status(500).send(err));
    } else {
        // TODO: implement getTenants for Azure
        res.status(501).send('Not Implemented for Azure');
    }
}

export function switchTenant(req: Request, res: Response) {
    const { tenantId } = req.params;
    if (tenantId) {
        const url = 'https://login.microsoftonline.com/' + tenantId + '/oauth2/authorize' +
            '?response_type=id_token code' +
            `&redirect_uri=${constants.authentication.redirectUrl}` +
            `&client_id=${process.env.AADClientId}` +
            `&resource=${constants.authentication.resource}` +
            `&scope=${constants.authentication.scope}` +
            // This is just for localhost.
            // TODO: figure out what tenant switching means for OnPrem.
            // TODO: investigate using same nonce logic as the adal package.
            `&nonce=${uuid4()}` +
            '&site_id=500879' +
            `&response_mode=query` +
            `&state=`;
        res.redirect(url);
    } else {
        res.status(400).send('tenantId not specified.');
    }
}

export function getToken(req: Request, res: Response) {
    const user = req.user as User;
    if (req.query.plaintext) {
        res.send(user.token.access_token);
    } else {
        res.json(user);
    }
}

function authStrategy() {
    const strategyConfig = {
        clientID: process.env.AADClientId,
        clientSecret: process.env.AADClientSecret,
        callbackURL: 'https://localhost:44300/manage',
        resource: 'https://management.core.windows.net/'
    };

    const userReducer = (_: string, __: string, params: Token, ___: any, done: any) => {
        const user = jwt.decode(params.id_token) as User;
        user.token = params;
        done(null, user);
    };
    return new strategy(strategyConfig, userReducer);
}

function deserializeUser(user: User, done: any) {
    done(null, user);
}

function serializeUser(user: User, done: any) {
    done(null, user);
}