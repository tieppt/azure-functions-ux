import { Component } from '@angular/core';
import { ProviderCard } from 'app/site/deployment-center/deployment-center-setup/step-source-control/step-source-control.component';
import { DeploymentCenterStateManager } from 'app/site/deployment-center/deployment-center-setup/wizard-logic/deployment-center-state-manager';
import { TranslateService } from '@ngx-translate/core';
import { PortalResources } from '../../../../shared/models/portal-resources';

@Component({
    selector: 'app-step-build-provider',
    templateUrl: './step-build-provider.component.html',
    styleUrls: ['./step-build-provider.component.scss', '../deployment-center-setup.component.scss']
})
export class StepBuildProviderComponent {
    public readonly providerCards: ProviderCard[] = [
        {
            id: 'vsts',
            name: this._translateService.instant(PortalResources.vstsBuildServerTitle),
            icon: 'image/deployment-center/onedrive-logo.svg',
            color: '#68227A',
            barColor: '#CED2EA',
            description: this._translateService.instant(PortalResources.vstsBuildServerDesc),
            authorizedStatus: 'none'
        },
        {
            id: 'kudu',
            name: this._translateService.instant(PortalResources.kuduTitle),
            icon: 'image/deployment-center/onedrive-logo.svg',
            color: '#000000',
            barColor: '#D6D6D6',
            description: this._translateService.instant(PortalResources.kuduDesc),
            authorizedStatus: 'none'
        }
    ];

    public selectedProvider: ProviderCard = null;

    constructor(public wizard: DeploymentCenterStateManager, private _translateService: TranslateService) {}

    chooseBuildProvider(card: ProviderCard) {
        const currentFormValues = this.wizard.wizardValues;
        currentFormValues.buildProvider = card.id;
        this.wizard.wizardValues = currentFormValues;
    }
}
