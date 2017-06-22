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
  selector: 'connection-strings',
  templateUrl: './connection-strings.component.html',
  styleUrls: ['./connection-strings.component.scss']
})
export class ConnectionStringsComponent implements OnInit {
  public connectionStringTypes: DropDownElement<ConnectionStringType>[];
  public Resources = PortalResources;
  public groupArray: FormArray;

  //public mainFormStream: Subject<FormGroup>;
  public resourceIdStream: Subject<string>;
  private _subscription: RxSubscription;

  private _connectionStringsArm: ArmObj<ConnectionStrings>;
  private _busyState: BusyStateComponent;
  private _busyStateKey: string;

  private _resourceId: string;
  public _mainForm: FormGroup;

  private _requiredValidator: RequiredValidator;
  private _uniqueCsValidator: UniqueValidator;

constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    tabsComponent: TabsComponent
    ) {
      this._busyState = tabsComponent.busyState;
      this._busyState.clear.subscribe(event => this._busyStateKey = undefined);

      this.resourceIdStream = new Subject<string>();
      /*
      this.mainFormStream = new Subject<FormGroup>();

      this._subscription = 
      Observable.zip(
          this.mainFormStream,
          this.resourceIdStream,
          (g, r) => ({mainForm: g, resourceId: r})
      )
      .distinctUntilChanged()
      .switchMap(s => {
        this._resourceId = s.resourceId;
        this._mainForm = s.mainForm;
        this.setScopedBusyState()
        // Not bothering to check RBAC since this component will only be used in Standalone mode
        return this._cacheService.postArm(`${this._resourceId}/config/connectionstrings/list`, true)
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/app-settings", error);
        this.clearScopedBusyState();
      })
      .retry()
      .subscribe(r => {
          this.clearScopedBusyState();
          this._connectionStringsArm = r.json();
          this._setupForm(this._connectionStringsArm);
      });
      */

      this._subscription = 
      this.resourceIdStream
      .distinctUntilChanged()
      .switchMap(resourceId => {
        this._resourceId = resourceId;
        this.setScopedBusyState()
        // Not bothering to check RBAC since this component will only be used in Standalone mode
        return this._cacheService.postArm(`${this._resourceId}/config/connectionstrings/list`, true)
      })
      .do(null, error => {
        this._aiService.trackEvent("/errors/app-settings", error);
        this.clearScopedBusyState();
      })
      .retry()
      .subscribe(r => {
          this.clearScopedBusyState();
          this._connectionStringsArm = r.json();
          this._setupForm(this._connectionStringsArm);
      });
  }

  private _setupForm(connectionStringsArm: ArmObj<ConnectionStrings>){
    if(!connectionStringsArm){
        return;
    }

    this.groupArray = this._fb.array([]);

    this._requiredValidator = new RequiredValidator(this._translateService);
 
    this._uniqueCsValidator = new UniqueValidator(
      "name",
      this.groupArray,
      this._translateService.instant(PortalResources.validation_duplicateError));

    for(let name in connectionStringsArm.properties){
      if(connectionStringsArm.properties.hasOwnProperty(name)){

        let connectionString = connectionStringsArm.properties[name];
        let connectionStringDropDownTypes = this._getConnectionStringTypes(connectionString.type);

        let group = this._fb.group({
          name: [
            name,
            Validators.compose([
              this._requiredValidator.validate.bind(this._requiredValidator),
              this._uniqueCsValidator.validate.bind(this._uniqueCsValidator)])],
          value: [connectionString.value],
          type: [connectionStringDropDownTypes.find(t => t.default).value]
        });

        (<any>group).csTypes = connectionStringDropDownTypes;
        this.groupArray.push(group);
      }
    }

    if(this._mainForm.contains("connectionStrings")){
      this._mainForm.setControl("connectionStrings", this.groupArray);
    }
    else{
      this._mainForm.addControl("connectionStrings", this.groupArray);
    }

  }

  setupForm(){
    this._setupForm(this._connectionStringsArm);
  }

  @Input() set mainForm(value: FormGroup){
    this._mainForm = value;
    //this.mainFormStream.next(value);
    this._setupForm(this._connectionStringsArm);
  }

  @Input() set resourceId(value : string){
    this.resourceIdStream.next(value);
  }

  ngOnChanges(changes: SimpleChanges){
    // let resourceIdChanged = false;

    // if (changes['resourceId']) {

    // }

    // if(changes['mainForm'])
    // {

    // }
  }

  ngOnInit() {
  }

  ngOnDestroy(): void{
    this._subscription.unsubscribe();
  }

  validate(){
    let connectionStringGroups = this.groupArray.controls;
    connectionStringGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for(let controlName in controls){
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });
  }

  save() : Observable<boolean>{
    let connectionStringGroups = this.groupArray.controls;

    if(this._mainForm.valid){
      let connectionStringsArm: ArmObj<any> = JSON.parse(JSON.stringify(this._connectionStringsArm));
      delete connectionStringsArm.properties;
      connectionStringsArm.properties = {};

      for(let i = 0; i < connectionStringGroups.length; i++){
        let connectionStringControl = connectionStringGroups[i];
        let connectionString = {
          value: connectionStringControl.value.value,
          type: ConnectionStringType[connectionStringControl.value.type]
        }

        connectionStringsArm.properties[connectionStringGroups[i].value.name] = connectionString;
      }

      return this._cacheService.putArm(`${this._resourceId}/config/connectionstrings`, null, connectionStringsArm)
      .map(connectionStringsResponse => {
        this._connectionStringsArm = connectionStringsResponse.json();
        return Observable.of(true);
      })
      .catch(error => {
        return Observable.of(false);
      });
    }
    else{
      return Observable.of(false);
    }
  }

  //discard(){
  //  this._mainForm.controls["connectionStrings"].reset();
  //  this._setupForm(this._connectionStringsArm);
  //}

  deleteConnectionString(group: FormGroup){
    let connectionStrings = this.groupArray;
    this._deleteRow(group, connectionStrings);
    connectionStrings.updateValueAndValidity();
  }

  private _deleteRow(group: FormGroup, formArray: FormArray){
    let index = formArray.controls.indexOf(group);
    if (index >= 0){
      formArray.controls.splice(index, 1);
      group.markAsDirty();
    }
  }

  addConnectionString(){
    let connectionStrings = this.groupArray;
    let connectionStringDropDownTypes = this._getConnectionStringTypes(ConnectionStringType.SQLAzure);

    let group = this._fb.group({
      name: [
        null,
        Validators.compose([
          this._requiredValidator.validate.bind(this._requiredValidator),
          this._uniqueCsValidator.validate.bind(this._uniqueCsValidator)])],
      value: [null],
      type: [connectionStringDropDownTypes.find(t => t.default).value]
    });

    (<any>group).csTypes = connectionStringDropDownTypes;
    connectionStrings.push(group);

    (<CustomFormGroup>group)._msStartInEditMode = true;

    this._mainForm.markAsDirty();
  }

  private _getConnectionStringTypes(defaultType: ConnectionStringType){
      let connectionStringDropDownTypes: DropDownElement<string>[] = []

      EnumEx.getNamesAndValues(ConnectionStringType).forEach(pair => {
        connectionStringDropDownTypes.push({
          displayLabel: pair.name,
          value: pair.name,
          default: pair.value === defaultType
        })
      })

      return connectionStringDropDownTypes;
  }

  private setScopedBusyState(){
    this._busyStateKey = this._busyState.setScopedBusyState(this._busyStateKey);
  }

  private clearScopedBusyState(){
    this._busyState.clearScopedBusyState(this._busyStateKey);
    this._busyStateKey = undefined;
  }

/*
  private setScopedBusyState(){
    this._setScopedBusyState(this._busyStateKey, this._busyState);
  }

  private clearScopedBusyState(){
    this._clearScopedBusyState(this._busyStateKey, this._busyState);
  }

  private _setScopedBusyState(busyStateKey: string, busyState: BusyStateComponent){
    busyStateKey = busyState.setScopedBusyState(busyStateKey);
  }

  private _clearScopedBusyState(busyStateKey: string, busyState: BusyStateComponent){
    busyState.clearScopedBusyState(busyStateKey);
    busyStateKey = undefined;
  }
*/
}