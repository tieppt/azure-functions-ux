import * as https from 'https';
import * as fs from 'fs';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as logger from 'morgan';
import * as passport from 'passport';
import * as session from 'express-session';
import * as cookieParser from 'cookie-parser';

import './polyfills';
import { getTenants, getToken } from './test-helpers/authentication';
import { getConfig } from './actions/ux-config';
import { proxy } from './actions/proxy';
import { getBindingConfig, getResources, getRuntimeVersion, getRoutingVersion, getTemplates } from './actions/metadata';
import { setupAuthentication, authenticate } from './test-helpers/authentication';
import { staticConfig } from './config';
import { setupDeploymentCenter } from './deployment-center/deployment-center';
import { getLinuxRuntimeToken } from './actions/linux-function-app';
import { triggerFunctionAPIM } from './actions/apim';

const app = express();

app
    .use(express.static(path.join(__dirname, 'public')))
    .use(logger('dev'))
    .set('view engine', 'pug')
    .set('views', 'src/views')
    .use(session({ secret: 'keyboard cat' }))
    .use(bodyParser.json())
    .use(cookieParser())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(passport.initialize())
    .use(passport.session());

setupAuthentication(app);

const renderIndex = (req: express.Request, res: express.Response) => {
    staticConfig.config.clientOptimzationsOff = req.query['appsvc.clientoptimizations'] && req.query['appsvc.clientoptimizations'] === 'false';
    res.render('index', staticConfig);
};

app.get('/', authenticate, renderIndex);

app.get('/manage', authenticate, (_, res) => {
    res.redirect('/.login')
});

app.get('/api/ping', (_, res) => {
    res.send('success');
});

app.get('/api/health', (_, res) => {
    res.send('healthy');
});

app.get('/api/templates', getTemplates);
app.get('/api/bindingconfig', getBindingConfig);

app.get('/api/resources', getResources);
app.get('/api/latestruntime', getRuntimeVersion);
app.get('/api/latestrouting', getRoutingVersion);
app.get('/api/config', getConfig);
app.post('/api/proxy', proxy);
app.post('/api/passthrough', proxy);
app.post('/api/triggerFunctionAPIM', triggerFunctionAPIM);
app.get('/api/runtimetoken/*', getLinuxRuntimeToken)

app.get('/api/tenants', authenticate, getTenants);
app.get('/api/token', authenticate, getToken);

setupDeploymentCenter(app);
// if are here, that means we didn't match any of the routes above including those for static content.
// render index and let angular handle the path.
app.get('*', renderIndex);
//This is for localhost development
var privateKey = fs.readFileSync('selfcertkey.pem', 'utf8');
var certificate = fs.readFileSync('selfcert.pem', 'utf8');

const httpsServer = https.createServer({ key: privateKey, cert: certificate }, app as any);

httpsServer.listen(44300);