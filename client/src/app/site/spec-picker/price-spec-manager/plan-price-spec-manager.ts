import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from 'app/shared/models/portal-resources';
import { SpecPickerComponent } from './../spec-picker.component';
import { SpecCostQueryResult, SpecResourceSet } from './../price-spec-manager/billing-models';
import { PriceSpecGroup, DevSpecGroup, ProdSpecGroup, IsolatedSpecGroup } from './price-spec-group';
import { PortalService } from './../../../shared/services/portal.service';
import { PlanService } from './../../../shared/services/plan.service';
import { Injector } from '@angular/core';
import { ArmSubcriptionDescriptor } from '../../../shared/resourceDescriptors';
import { Observable } from 'rxjs/Observable';
import { ResourceId, ArmObj } from '../../../shared/models/arm/arm-obj';
import { ServerFarm } from '../../../shared/models/server-farm';
import { SpecCostQueryInput } from './billing-models';
import { PriceSpecInput } from './price-spec';

export interface SpecPickerInput<T> {
    id: ResourceId;
    data?: T;
}

export interface NewPlanSpeckPickerData {
    subscriptionId: string;
    location: string;
    hostingEnvironmentName: string | null;
    allowAseV2Creation: boolean;
    forbiddenSkus: string[];
    isLinux: boolean;
    isXenon: boolean;
    selectedLegacySkuName: string;  // Looks like "small_standard"
}

export class PlanPriceSpecManager {

    selectedSpecGroup: PriceSpecGroup;
    specGroups: PriceSpecGroup[] = [
        new DevSpecGroup(this._injector),
        new ProdSpecGroup(this._injector),
        new IsolatedSpecGroup(this._injector)];

    get currentSkuCode(): string {
        if (!this._plan) {
            return null;
        }

        return this._plan.sku.name;
    }

    private _planService: PlanService;
    private _portalService: PortalService;
    private _ts: TranslateService;
    private _plan: ArmObj<ServerFarm>;
    private _subscriptionId: string;
    private _inputs: SpecPickerInput<NewPlanSpeckPickerData>;

    constructor(private _specPicker: SpecPickerComponent, private _injector: Injector) {
        this._planService = _injector.get(PlanService);
        this._portalService = _injector.get(PortalService);
        this._ts = _injector.get(TranslateService);
    }

    initialize(inputs: SpecPickerInput<NewPlanSpeckPickerData>) {
        this._inputs = inputs;
        this._subscriptionId = new ArmSubcriptionDescriptor(inputs.id).subscriptionId;
        this.selectedSpecGroup = this.specGroups[0];

        return this._getBillingMeters(inputs)
            .switchMap(r => {
                if (!r) {
                    return Observable.of(null);
                }

                const billingMeters = r;
                let specInitCalls: Observable<void>[] = [];

                // Initialize every spec for each spec group.  For most cards this is a no-op, but
                // some require special handling so that we know if we need to hide/disable a card.
                this.specGroups.forEach(g => {
                    const input: PriceSpecInput = {
                        specPickerInput: inputs,
                        billingMeters: billingMeters,
                        plan: this._plan,
                        subscriptionId: this._subscriptionId
                    };

                    g.initialize(input);
                    specInitCalls = specInitCalls.concat(g.specs.map(s => s.initialize(input)));
                });

                return Observable.zip(...specInitCalls);
            })
            .do(_ => {
                this._cleanUpGroups();
            });
    }

    getSpecCosts() {
        let specResourceSets: SpecResourceSet[] = [];
        let specsToAllowZeroCost: string[] = [];

        this.specGroups.forEach(g => {
            specResourceSets = specResourceSets.concat(g.specs.map(s => s.specResourceSet));
            specsToAllowZeroCost = specsToAllowZeroCost.concat(g.specs.filter(s => s.allowZeroCost).map(s => s.specResourceSet.id));
        });

        const query: SpecCostQueryInput = {
            subscriptionId: this._subscriptionId,
            specResourceSets: specResourceSets,
            specsToAllowZeroCost: specsToAllowZeroCost,
            specType: 'WebsitesExtension',
        };

        return this._portalService.getSpecCosts(query)
            .do(result => {
                this.specGroups.forEach(g => this._updatePriceStrings(result, g));
            });
    }

    applySelectedSpec() {
        const plan: ArmObj<ServerFarm> = JSON.parse(JSON.stringify(this._plan));
        plan.sku = {
            name: this.selectedSpecGroup.selectedSpec.skuCode
        };

        return this._planService.updatePlan(plan)
            .do(r => {
                if (r.isSuccessful) {
                    this._plan = r.result.json();
                    this._cleanUpGroups();
                }
            });
    }

    private _getBillingMeters(inputs: SpecPickerInput<NewPlanSpeckPickerData>) {
        // If we're getting meters for an existing plan
        if (!inputs.data) {

            return this._planService.getPlan(inputs.id, true)
                .switchMap(r => {

                    if (r.isSuccessful) {
                        this._plan = r.result;

                        if (this._plan.sku.name === 'Y1') {
                            this._specPicker.statusMessage = {
                                message: this._ts.instant(PortalResources.pricing_notAvailableConsumption),
                                level: 'error'
                            };

                            this._specPicker.shieldEnabled = true;
                        }
                    } else {
                        this._specPicker.statusMessage = {
                            message: this._ts.instant(PortalResources.pricing_noWritePermissionsOnPlan),
                            level: 'error'
                        };

                        this._specPicker.shieldEnabled = true;

                        return Observable.of(null);
                    }

                    return this._planService.getBillingMeters(this._subscriptionId, this._plan.location);
                });
        }

        // We're getting meters for a new plan
        return this._planService.getBillingMeters(inputs.data.subscriptionId, inputs.data.location);
    }

    private _updatePriceStrings(result: SpecCostQueryResult, specGroup: PriceSpecGroup) {
        specGroup.specs.forEach(spec => {
            const costResult = result.costs.find(c => c.id === spec.specResourceSet.id);
            if (costResult.amount === 0.0) {
                spec.priceString = 'Free';
            } else {
                const meter = costResult.firstParty[0].meters[0];
                spec.priceString = this._ts.instant(PortalResources.pricing_pricePerHour).format(meter.perUnitAmount, meter.perUnitCurrencyCode);
            }
        });
    }

    private _cleanUpGroups() {
        let nonEmptyGroupIndex = 0;
        let foundNonEmptyGroup = false;

        // Remove hidden and forbidden specs and move disabled specs to end of list.
        this.specGroups.forEach((g, i) => {

            let enabledSpecs = g.specs.filter(s => s.state !== 'disabled' && s.state !== 'hidden');

            if (this._inputs.data) {
                enabledSpecs = enabledSpecs.filter(s => !this._inputs.data.forbiddenSkus.find(sku => sku.toLowerCase() === s.legacySkuName.toLowerCase()));
            }

            const disabledSpecs = g.specs.filter(s => s.state === 'disabled');

            g.specs = enabledSpecs.concat(disabledSpecs);

            // Find a selected spec within a group
            g.selectedSpec = g.specs.find((s, specIndex) => {

                if ((this._plan && s.skuCode.toLowerCase() === this._plan.sku.name.toLowerCase())
                    || (this._inputs.data && this._inputs.data.selectedLegacySkuName === s.legacySkuName)) {

                    // If the current SKU is below the fold, then automatically expand the group.
                    g.isExpanded = specIndex > 3;
                    return true;
                }

                return false;
            });

            if (!foundNonEmptyGroup && g.specs.length === 0) {
                nonEmptyGroupIndex++;
            } else {
                foundNonEmptyGroup = true;
            }
        });

        if (nonEmptyGroupIndex < this.specGroups.length) {
            // The UI loads the default set of cards immediately, but the specManager filters them out
            // based on each cards initialization logic.  Angular isn't able to detect the updated filtered
            // view in the list, so we're forcing an update by creating a new reference
            this.specGroups[nonEmptyGroupIndex] = Object.assign({}, this.specGroups[nonEmptyGroupIndex]);
            this.selectedSpecGroup = this.specGroups[nonEmptyGroupIndex];

            // Find the first group with a selectedSpec and make that group the default
            for (let i = nonEmptyGroupIndex; i < this.specGroups.length; i++) {
                if (this.specGroups[i].selectedSpec) {
                    this.selectedSpecGroup = this.specGroups[i];
                    break;
                }
            }
        }
    }
}
