import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
import { FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription as RxSubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { AiService } from './../../../shared/services/ai.service';
import { PortalResources } from './../../../shared/models/portal-resources';
import { EnumEx } from './../../../shared/Utilities/enumEx';
import { DropDownElement } from './../../../shared/models/drop-down-element';
import { ConnectionStrings, ConnectionStringType } from './../../../shared/models/arm/connection-strings';
import { BusyStateComponent } from './../../../busy-state/busy-state.component';
import { TabsComponent } from './../../../tabs/tabs.component';
import { CustomFormGroup, CustomFormControl } from './../../../controls/click-to-edit/click-to-edit.component';
import { ArmObj, ArmArrayResult } from './../../../shared/models/arm/arm-obj';
import { TblItem } from './../../../controls/tbl/tbl.component';
import { CacheService } from './../../../shared/services/cache.service';
import { TreeViewInfo } from './../../../tree-view/models/tree-view-info';
import { UniqueValidator } from 'app/shared/validators/uniqueValidator';
import { RequiredValidator } from 'app/shared/validators/requiredValidator';

@Component({
  selector: 'app-settings',
  templateUrl: './app-settings.component.html',
  styleUrls: ['./app-settings.component.scss']
})
export class AppSettingsComponent implements OnInit, OnChanges {
  public Resources = PortalResources;
  public groupArray: FormArray;

  public mainFormStream: Subject<FormGroup>;
  public resourceIdStream: Subject<string>;
  private _subscription: RxSubscription;

  private _appSettingsArm: ArmObj<any>;
  private _busyState: BusyStateComponent;

  private _resourceId: string;
  private _mainForm: FormGroup;

  private _requiredValidator: RequiredValidator;
  private _uniqueAppSettingValidator: UniqueValidator;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;

      this.mainFormStream = new Subject<FormGroup>();
      this.resourceIdStream = new Subject<string>();

      this._subscription = 
      Observable.zip(
          this.mainFormStream.distinctUntilChanged(),
          this.resourceIdStream.distinctUntilChanged(),
          (g, r) => ({mainForm: g, resourceId: r})
      )
      .switchMap(s => {
        this._resourceId = s.resourceId;
        this._mainForm = s.mainForm;
        this._busyState.setBusyState();
        // Not bothering to check RBAC since this component will only be used in Standalone mode
        return this._cacheService.postArm(`${this._resourceId}/config/appSettings/list`, true)
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/app-settings", error);
        this._busyState.clearBusyState();
      })
      .retry()
      .subscribe(r => {
          this._busyState.clearBusyState();
          this._appSettingsArm = r.json();
          this._setupForm(this._appSettingsArm);
      });
  }

  private _setupForm(appSettingsArm: ArmObj<any>){
    this.groupArray = this._fb.array([]);

    this._requiredValidator = new RequiredValidator(this._translateService);
    this._uniqueAppSettingValidator = new UniqueValidator(
      "name",
      this.groupArray,
      this._translateService.instant(PortalResources.validation_duplicateError));

    for(let name in appSettingsArm.properties){
      if(appSettingsArm.properties.hasOwnProperty(name)){

        this.groupArray.push(this._fb.group({
          name: [
            name,
            Validators.compose([
              this._requiredValidator.validate.bind(this._requiredValidator),
              this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)])],
            value: [appSettingsArm.properties[name]]
        }));

      }
    }

    if(this._mainForm.contains("appSettings")){
      this._mainForm.setControl("appSettings", this.groupArray);
    }
    else{
      this._mainForm.addControl("appSettings", this.groupArray);
    }

  }

  @Input() set mainForm(value: FormGroup){
      this.mainFormStream.next(value);
  }

  @Input() set resourceId(value : string){
      this.resourceIdStream.next(value);
  }

  ngOnChanges(changes: SimpleChanges){
    // if (changes['mainForm'] || changes['resourceId']) {
    // }
  }

  ngOnInit() {
  }

  ngOnDestroy(): void{
    this._subscription.unsubscribe();
  }

  save() : Observable<boolean>{
    let success = false;

    let appSettingGroups = this.groupArray.controls;
    appSettingGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for(let controlName in controls){
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });

    if(this._mainForm.valid){
      let appSettingsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._appSettingsArm));
      delete appSettingsArm.properties;
      appSettingsArm.properties = {};

      for(let i = 0; i < appSettingGroups.length; i++){
        appSettingsArm.properties[appSettingGroups[i].value.name] = appSettingGroups[i].value.value;
      }

      this._busyState.setBusyState();

      this._cacheService.putArm(`${this._resourceId}/config/appSettings`, null, appSettingsArm)
      .subscribe(appSettingsResponse => {
        this._appSettingsArm = appSettingsResponse.json();
        this._setupForm(this._appSettingsArm);
        this._busyState.clearBusyState();
        success = true;
      });
    }

    return Observable.of(success);
  }

  discard() : Observable<boolean>{
    this.groupArray.reset();
    this._setupForm(this._appSettingsArm);
    return Observable.of(true);
  }

  deleteAppSetting(group: FormGroup){
    let appSettings = this.groupArray;
    this._deleteRow(group, appSettings);
    appSettings.updateValueAndValidity();
  }

  private _deleteRow(group: FormGroup, formArray: FormArray){
    let index = formArray.controls.indexOf(group);
    if (index >= 0){
      formArray.controls.splice(index, 1);
      group.markAsDirty();
    }
  }

  addAppSetting(){
    let appSettings = this.groupArray;
    let group = this._fb.group({
        name: [
          null,
          Validators.compose([
            this._requiredValidator.validate.bind(this._requiredValidator),
            this._uniqueAppSettingValidator.validate.bind(this._uniqueAppSettingValidator)])],
        value: [null]
      });

    (<CustomFormGroup>group)._msStartInEditMode = true;
    appSettings.push(group);
    this._mainForm.markAsDirty();
  }
}
