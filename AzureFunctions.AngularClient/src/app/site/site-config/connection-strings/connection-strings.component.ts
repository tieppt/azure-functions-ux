import { Component, OnInit, Input } from '@angular/core';
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
import { SiteConfig } from 'app/shared/models/arm/site-config';
import { AvailableStackNames, Version } from 'app/shared/models/constants';
import { AvailableStack, MinorVersion, MajorVersion, Framework } from 'app/shared/models/arm/stacks';
import { StacksHelper } from './../../../shared/Utilities/stacks.helper';

@Component({
  selector: 'connection-strings',
  templateUrl: './connection-strings.component.html',
  styleUrls: ['./connection-strings.component.scss']
})
export class ConnectionStringsComponent implements OnInit {
  public connectionStringTypes: DropDownElement<ConnectionStringType>[];
  public Resources = PortalResources;
  public groupArray: FormArray;

  private _connectionStringsArm: ArmObj<ConnectionStrings>;
  private _busyState: BusyStateComponent;

  private _requiredValidator: RequiredValidator;
  private _uniqueCsValidator: UniqueValidator;

  constructor(
    private _cacheService: CacheService,
    private _fb: FormBuilder,
    private _translateService: TranslateService,
    private _aiService: AiService,
    tabsComponent: TabsComponent
    ) {
      //this._busyState = tabsComponent.busyState;
  }

  private _setupForm(connectionStringsArm: ArmObj<ConnectionStrings>){
      this.groupArray = this._fb.array([]);

      this._requiredValidator = new RequiredValidator(this._translateService);

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

    if(this.mainGroup.contains("connectionStrings")){
      this.mainGroup.setControl("connectionStrings", this.groupArray);
    }
    else{
      this.mainGroup.addControl("connectionStrings", this.groupArray);
    }

  }

  @Input() mainGroup : FormGroup;

  @Input() resourceId : string;

  ngOnInit() {
  }

  ngOnDestroy(): void{
    //this._viewInfoSubscription.unsubscribe();
  }

  load(resourceId : string) : Observable<boolean>{
    this.resourceId = resourceId;
    let success = false;

    //if(this._resourceId && this.mainGroup){
        //this._busyState.setBusyState();
        this._cacheService.postArm(`${this.resourceId}/config/connectionstrings/list`, true)
        .do(null, error => {
            this._aiService.trackEvent("/errors/site-config", error);
            //this._busyState.clearBusyState();
        })
        .retry()
        .subscribe(r => {
            //this._busyState.clearBusyState();
            this._connectionStringsArm = r.json();
            this._setupForm(this._connectionStringsArm);
            success = true;
        });
    //}
    return Observable.of(success);
  }

  save() : Observable<boolean>{
    let success = false;

    let connectionStringGroups = (<FormArray>this.mainGroup.controls["connectionStrings"]).controls;
    connectionStringGroups.forEach(group => {
      let controls = (<FormGroup>group).controls;
      for(let controlName in controls){
        let control = <CustomFormControl>controls[controlName];
        control._msRunValidation = true;
        control.updateValueAndValidity();
      }
    });

    if(this.mainGroup.valid){
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

      //this._busyState.setBusyState();

      this._cacheService.putArm(`${this.resourceId}/config/connectionstrings`, null, connectionStringsArm)
      .subscribe(r => {
        //this._busyState.clearBusyState();
        this._connectionStringsArm = r.connectionStringsResponse.json();
        this._setupForm(this._connectionStringsArm);
        success = true;
      });
    }

    return Observable.of(success);
  }

  discard() : Observable<boolean>{
    this.mainGroup.controls["connectionStrings"].reset();
    this._setupForm(this._connectionStringsArm);
    return Observable.of(true);
  }

  deleteConnectionString(group: FormGroup){
    let connectionStrings = <FormArray>this.mainGroup.controls["connectionStrings"];
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

    let connectionStrings = <FormArray>this.mainGroup.controls["connectionStrings"];
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

    this.mainGroup.markAsDirty();
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
}
