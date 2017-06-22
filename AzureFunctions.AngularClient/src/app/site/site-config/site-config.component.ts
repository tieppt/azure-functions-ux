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
  // private _webConfigArm: ArmObj<SiteConfig>;
  // private _availableStacksArm: ArmArrayResult<AvailableStack>;
  private _busyState: BusyStateComponent;

  // private _availableStacksLoaded = false;
  // private _javaMajorToMinorMap: Map<string, MinorVersion[]>;
  // private _workerProcess64BitEnabled = false;
  // private _webSocketsEnabled = false;

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

/*
  private _setupForm(appSettingsArm: ArmObj<any>, connectionStringsArm: ArmObj<ConnectionStrings>, webConfigArm: ArmObj<SiteConfig>){
      let generalSettings = this._fb.group({});

      let netFrameWorkVersion = this._addWebConfigSetting("netFrameworkVersion");
      (<any>netFrameWorkVersion).creationTime = new Date();
      let phpVersion = this._addWebConfigSetting("phpVersion");
      (<any>phpVersion).creationTime = new Date();
      let javaVersion = this._addWebConfigSetting("javaVersion");
      (<any>javaVersion).creationTime = new Date();
      let pythonVersion = this._addWebConfigSetting("pythonVersion");
      (<any>pythonVersion).creationTime = new Date();


      generalSettings = this._fb.group({
        netFrameWorkVersion: netFrameWorkVersion,
        phpVersion: phpVersion,
        javaVersion: javaVersion,
        pythonVersion: pythonVersion
      });


      this.mainForm = this._fb.group({
        generalSettings: generalSettings
      });
  }

  private _addWebConfigSetting(settingName : string)
  {
      let stackMetadata = StacksHelper.GetStackMetadata(settingName, null);
      let configValue = this._webConfigArm.properties[settingName];
      let dropDownOptions = this._getStackMajorVersions(stackMetadata.AvailableStackName, configValue);
      let value = [dropDownOptions.find(t => t.default).value]
      let group = this._fb.group({
        //name: [settingName],
        value: [dropDownOptions.find(t => t.default).value]
      });
      //group.controls["value"].disable();
      (<any>group).options = dropDownOptions;
      (<any>group).friendlyName = stackMetadata.FriendlyName;
      return group;
  }

  private _getStackMajorVersions(stackName: AvailableStackNames, defaultVersion: string){
      let dropDownElements: DropDownElement<string>[] = []

      dropDownElements.push({
          displayLabel: "Off",
          value: "Off",
          default: !defaultVersion
      })

      this._getAvailableStack(stackName).majorVersions.forEach(majorVersion => {
        dropDownElements.push({
          displayLabel: majorVersion.displayVersion,
          value: majorVersion.displayVersion,
          default: majorVersion.runtimeVersion === defaultVersion
        })
      })

      return dropDownElements;
  }

  private _getAvailableStack(stackName: AvailableStackNames){
    if (!(this._availableStacksLoaded) || !this._availableStacksArm || !this._availableStacksArm.value || this._availableStacksArm.value.length === 0) {
      return null;
    }
    return this._availableStacksArm.value.find(stackArm => stackArm.properties.name === stackName).properties;
  }
*/
  @Input() set viewInfoInput(viewInfo: TreeViewInfo){
      this.viewInfoStream.next(viewInfo);
  }

  ngOnInit() {
  }

  ngOnDestroy(): void{
    this._viewInfoSubscription.unsubscribe();
  }

  save(){
    this.appSettings.validate();
    this.connectionStrings.validate();

    this._busyState.setBusyState();
    Observable.zip(
      this.appSettings.save(),
      this.connectionStrings.save(),
      (a, c) => ({appSettingsSaved: a, connectionStringsSaved: c})
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
