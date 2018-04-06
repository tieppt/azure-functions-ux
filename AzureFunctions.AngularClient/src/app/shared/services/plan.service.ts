import { BillingMeter } from './../models/arm/billingMeter';
import { ArmService } from 'app/shared/services/arm.service';
import { ArmProviderInfo } from './../models/arm/ArmProviderInfo';
import { ServerFarm } from './../models/server-farm';
import { ResourceId, ArmObj, AvailableSku } from 'app/shared/models/arm/arm-obj';
import { Observable } from 'rxjs/Observable';
import { HttpResult } from '../models/http-result';
import { Injectable, Injector } from '@angular/core';
import { ConditionalHttpClient } from '../conditional-http-client';
import { UserService } from './user.service';
import { CacheService } from './cache.service';
import { GeoRegion } from '../models/arm/georegion';
import { SpecCostQueryInput } from '../../site/spec-picker/price-spec-manager/billing-models';
import { Subject } from 'rxjs/Subject';


type Result<T> = Observable<HttpResult<T>>;

@Injectable()
export class PlanService {
    private readonly _client: ConditionalHttpClient;

    constructor(
        userService: UserService,
        injector: Injector,
        private _cacheService: CacheService,
        private _armService: ArmService) {

        this._client = new ConditionalHttpClient(injector, _ => userService.getStartupInfo().map(i => i.token));
    }

    getPlan(resourceId: ResourceId, force?: boolean): Result<ArmObj<ServerFarm>> {
        const getPlan = this._cacheService.getArm(resourceId, force).map(r => r.json());
        return this._client.execute({ resourceId: resourceId }, t => getPlan);
    }


    updatePlan(plan: ArmObj<ServerFarm>) {
        const updatePlan = this._cacheService.putArm(plan.id, null, plan);
        return this._client.execute({ resourceId: plan.id }, t => updatePlan)
            .switchMap(r => {
                if (r.isSuccessful) {
                    const location = r.result.headers.get('Location');
                    const stopPolling = new Subject();

                    return Observable.timer(0, 2000)
                        .takeUntil(stopPolling)
                        .switchMap(t => {
                            const getUpdateResult = this._cacheService.get(location, true);
                            return this._client.execute({ resourceId: plan.id }, g => getUpdateResult);
                        })
                        .filter(p => {
                            // Only allow completed states to continue (ie anything but a 202 status code)
                            return p.isSuccessful ? p.result.status !== 202 : true;
                        })
                        .do(p => {
                            stopPolling.next();
                        });
                } else {
                    return Observable.of(r);
                }
            });
    }

    getAvailableSkusForPlan(resourceId: ResourceId): Observable<AvailableSku[]> {
        const getSkus = this._cacheService.getArm(resourceId + '/skus');
        return this._client.execute({ resourceId: resourceId }, t => getSkus).map(r => r.result.json().value);
    }

    getAvailablePremiumV2GeoRegions(subscriptionId: string) {
        return Observable.zip(
            this._getProviderLocations(subscriptionId, 'serverFarms'),
            this._getAllPremiumV2GeoRegions(subscriptionId))
            .map(r => {
                return this._getAvailableGeoRegionsList(r[1], r[0]);
            });
    }

    getBillingMeters(subscriptionId: string, location?: string): Observable<ArmObj<BillingMeter>[]> {
        let url = `${this._armService.armUrl}/subscriptions/${subscriptionId}/providers/Microsoft.Web/billingMeters?api-version=${this._armService.websiteApiVersion}`;
        if (location) {
            url += `&billingLocation=${location}`;
        }

        const getMeters = this._cacheService.get(url);
        return this._client.execute({ resourceId: url }, t => getMeters)
            .map(r => {
                return r.result.json().value;
            });
    }

    getSpecCosts(query: SpecCostQueryInput) {
        const url = `https://s2.billing.ext.azure.com/api/Billing/Subscription/GetSpecsCosts`;

        const getSpecCosts = this._cacheService.post(url, false, null, query);
        return this._client.execute({ resourceId: url }, t => getSpecCosts)
            .map(r => {
                return r.result.json();
            });
    }

    private _getProviderLocations(subscriptionId: string, resourceType: string): Observable<string[]> {
        const getProviderInfo = this._cacheService.getArm(`/subscriptions/${subscriptionId}/providers/microsoft.web`, false, '2018-01-01');

        return this._client.execute({ resourceId: '' }, t => getProviderInfo)
            .map(info => {
                const provider: ArmProviderInfo = info.result.json();
                return provider.resourceTypes.find(t => t.resourceType.toLowerCase() === resourceType.toLowerCase()).locations;
            });
    }

    private _getAllPremiumV2GeoRegions(subscriptionId: string): Observable<ArmObj<GeoRegion>[]> {
        const getPremiumV2Regions = this._cacheService.getArm(`/subscriptions/${subscriptionId}/providers/microsoft.web/georegions?sku=PremiumV2`);

        return this._client.execute({ resourceId: '' }, t => getPremiumV2Regions)
            .map(r => {
                return r.result.json().value;
            });
    }

    private _getAvailableGeoRegionsList(geoRegions: ArmObj<GeoRegion>[], providerLocations: string[]) {
        const itemsToRemove: ArmObj<GeoRegion>[] = [];
        geoRegions.forEach(geoRegion => {
            if (providerLocations.indexOf(geoRegion.properties.displayName) === -1) {
                itemsToRemove.push(geoRegion);
            }
        });

        return geoRegions.filter(geoRegion => itemsToRemove.indexOf(geoRegion) === -1);
    }

}