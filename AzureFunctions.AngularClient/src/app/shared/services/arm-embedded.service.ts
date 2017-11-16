import { Url } from './../Utilities/url';
// import { Regex } from './../models/constants';
import { Observable } from 'rxjs/Observable';
import { AiService } from './ai.service';
import { UserService } from './user.service';
import { Http, Headers, Response } from '@angular/http';

import { Injectable } from '@angular/core';
import { ArmService } from './arm.service';
// import { Constants } from 'app/shared/models/constants';

@Injectable()
export class ArmEmbeddedService extends ArmService {
    // private _envsExp = /.+\/environments\/(\w+)\/namespaces\/(\w+)$/gi;
    // private _envResourceIdExp = /.+(\/environments\/\w+\/namespaces\/\w+)$/gi;

    private _whiteListedPrefixUrls: string[] = [
        `https://blueridge-tip1-rp-westus.azurewebsites.net`
    ];

    constructor(http: Http,
        userService: UserService,
        aiService: AiService) {

        super(http, userService, aiService);
    }

    send(method: string, url: string, body?: any, etag?: string, headers?: Headers): Observable<Response> {
        const urlNoQuery = url.toLowerCase().split('?')[0];
        const path = Url.getPath(urlNoQuery);
        const pathParts = path.split('/').filter(part => !!part);

        // const entityMatches = /(\/providers\/microsoft.web\/[a-z0-9\-\/]+\/entities\/([a-z0-9\-]+))$/gi.exec(urlNoQuery);

        // if (entityMatches && entityMatches.length > 2) {
        //     return this._getFakeSiteObj(entityMatches);
        // }

        if (pathParts.length === 8 && pathParts[6] === 'entities') {
            return this._getFakeSiteObj(path, pathParts[7]);
        }

        if (urlNoQuery.endsWith('/config/authsettings/list')) {
            return Observable.of(this._getFakeResponse({
                id: Url.getPath(urlNoQuery),
                properties: {
                    enabled: false,
                    unauthenticatedClientAction: null,
                    clientId: null,
                }
            }));
        }

        if (this._whiteListedPrefixUrls.find(u => urlNoQuery.startsWith(u.toLowerCase()) || urlNoQuery.endsWith('.svg'))) {
            return super.send(method, url, body, etag, headers);
        }

        // const envsExpMatches = Regex.cdsEntityIdParts.exec(urlNoQuery);
        // } else if (urlNoQuery.endsWith('/providers/microsoft.authorization/permissions')) {
        //     return Observable.of(this._getFakeResponse({
        //         'value': [{
        //             'actions': ['*'],
        //             'notActions': []
        //         }],
        //         'nextLink': null
        //     }));
        // } else if (urlNoQuery.endsWith('/providers/microsoft.authorization/locks')) {
        //     return Observable.of(this._getFakeResponse({ 'value': [] }));
        // } else if (urlNoQuery.endsWith('/config/web')) {
        //     return Observable.of(<any>this._getFakeResponse({
        //         id: this._tryFunctionApp.site.id,
        //         properties: {
        //             scmType: 'None'
        //         }
        //     }));
        // } else if (urlNoQuery.endsWith('/appsettings/list')) {
        //     return this.tryFunctionApp.getFunctionContainerAppSettings()
        //         .map(r => {
        //             return this._getFakeResponse({
        //                 properties: r
        //             });
        //         });
        // } else if (urlNoQuery.endsWith('/slots')) {
        //     return Observable.of(this._getFakeResponse({ value: [] }));
        // }

        this._aiService.trackEvent('/try/arm-send-failure', {
            uri: url
        });

        throw new Error('[ArmTryService] - send: ' + url);
    }

    private _getFakeSiteObj(id: string, name: string) {
        // const url = envMatches[0];

        // const idMatches = /.*(\/environments\/[a-z0-9\-]+\/namespaces\/[a-z0-9\-]+\/entities\/[a-z0-9\-]+)/gi.exec(url);
        return Observable.of(this._getFakeResponse({
            id: id,
            name: name,
            kind: 'functionapp',
            properties: {

            }
        }));
    }

    private _getFakeResponse(jsonObj: any): any {
        return {
            headers: {
                get: () => {
                    return null;
                }
            },
            json: () => {
                return jsonObj;
            }
        };
    }


}
