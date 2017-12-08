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
    public static url = 'https://blueridge-tip1-rp-westus.azurewebsites.net';

    private _whitelistedRPPrefixUrls: string[] = [
        ArmEmbeddedService.url,
        '/api/passthrough'
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

        if (urlNoQuery.toLowerCase().endsWith('.svg')) {
            return super.send(method, url, body, etag, headers);
        }

        if (this._whitelistedRPPrefixUrls.find(u => urlNoQuery.startsWith(u.toLowerCase()))) {
            return super.send(method, url, body, etag, headers)
                .map(r => {
                    // Calls to Function management API's for embedded scenario's are wrapped with a standard API payload.
                    // To keep the code somewhat clean, we intercept the response and unwrap each payload so that it looks as
                    // similar as possible to Azure scenario's.  Not everything will be a one-to-one mapping between the two scenario's 
                    // but should have similar structure.

                    const response = r.json();
                    if (response.values) {
                        const values = response.values.map(v => {
                            const payload = v.properties;

                            // TODO: ellhamai - The API moved name to the wrapper payload.  I hope we can just duplicate it back to properties
                            payload.name = v.name;
                            return payload;
                        });

                        return this._getFakeResponse(values);

                    } else if (response.properties) {
                        const payload = response.properties;

                        // File content API is a special case because it is normally a string response in Azure, but it's
                        // wrapped as a subproperty in blueridge
                        if (payload.content) {
                            return this._getFakeResponse(null, payload.content);
                        } else {
                            // TODO: ellhamai - The API moved name to the wrapper payload.  I hope we can just duplicate it back to properties
                            payload.name = response.name;
                        }

                        return this._getFakeResponse(response.properties);
                    }

                    return r;
                });
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

        return Observable.of(this._getFakeResponse({
            id: id,
            name: name,
            kind: 'functionapp',
            properties: {

            }
        }));
    }

    private _getFakeResponse(jsonObj: any, text?: string): any {
        return {
            headers: {
                get: () => {
                    return null;
                }
            },
            json: () => {
                return jsonObj;
            },
            text: () => {
                return text;
            }
        };
    }
}

