import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { AiService } from './../../shared/services/ai.service';
import { PortalResources } from './../../shared/models/portal-resources';
import { DropDownElement } from './../../shared/models/drop-down-element';
import { BusyStateComponent } from './../../busy-state/busy-state.component';
import { TabsComponent } from './../../tabs/tabs.component';
//import { ArmObj, ArmArrayResult } from './../../shared/models/arm/arm-obj';
import { CacheService } from './../../shared/services/cache.service';
import { TreeViewInfo } from './../../tree-view/models/tree-view-info';
//import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
//import { RequiredValidator } from 'app/shared/validators/requiredValidator';
//import { SiteConfig } from 'app/shared/models/arm/site-config';
//import { AvailableStackNames, Version } from 'app/shared/models/constants';
//import { AvailableStack, MinorVersion, MajorVersion, Framework } from 'app/shared/models/arm/stacks';
//import { StacksHelper } from './../../shared/Utilities/stacks.helper';
import { GeneralSettingsComponent } from './general-settings/general-settings.component';
import { AppSettingsComponent } from './app-settings/app-settings.component';
import { ConnectionStringsComponent } from './connection-strings/connection-strings.component';

@Component({
  selector: 'site-config',
  templateUrl: './site-config.component.html',
  styleUrls: ['./site-config.component.scss']
})
export class SiteConfigComponent implements OnInit {
  public viewInfoStream: Subject<TreeViewInfo>;

  public mainForm: FormGroup;
  private resourceId: string;
  public Resources = PortalResources;

  private _viewInfoSubscription: RxSubscription;
  private _busyState: BusyStateComponent;

  @ViewChild(GeneralSettingsComponent) generalSettings : GeneralSettingsComponent;
  @ViewChild(AppSettingsComponent) appSettings : AppSettingsComponent;
  @ViewChild(ConnectionStringsComponent) connectionStrings : ConnectionStringsComponent;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;

      this.viewInfoStream = new Subject<TreeViewInfo>();
      this._viewInfoSubscription = this.viewInfoStream
      .distinctUntilChanged()
      .switchMap(viewInfo => {
        this.resourceId = viewInfo.resourceId;
        this.mainForm = this._fb.group({});
        (<any>this.mainForm).timeStamp = new Date();
        return Observable.of(viewInfo);
        // Not bothering to check RBAC since this component will only be used in Standalone mode
      })
      .subscribe();
  }

  @Input() set viewInfoInput(viewInfo: TreeViewInfo){
      this.viewInfoStream.next(viewInfo);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void{
    this._viewInfoSubscription.unsubscribe();
  }

  save(){
    this.generalSettings.validate();
    this.appSettings.validate();
    this.connectionStrings.validate();

    this._busyState.setBusyState();
    Observable.zip(
      this.generalSettings.save(),
      this.appSettings.save(),
      this.connectionStrings.save(),
      (g, a, c) => ({generalSettingsSaved: g, appSettingsSaved: a, connectionStringsSaved: c})
    )
    .subscribe(r => {
      this._busyState.clearBusyState();
      this.mainForm = this._fb.group({});
      (<any>this.mainForm).timeStamp = new Date();
    });
  }

  discard(){
    this.mainForm = this._fb.group({});
    (<any>this.mainForm).timeStamp = new Date();
  }
}
