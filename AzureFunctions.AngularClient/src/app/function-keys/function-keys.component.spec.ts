import { AppModule } from './../app.module';
import { AiService } from './../shared/services/ai.service';
import { UtilitiesService } from './../shared/services/utilities.service';
import { TranslateService } from '@ngx-translate/core';
import { BroadcastService } from './../shared/services/broadcast.service';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';


import { FunctionKeysComponent } from './function-keys.component';
import { DebugElement } from '@angular/core';

describe('FunctionKeysComponent', () => {
  let component: FunctionKeysComponent;
  let fixture: ComponentFixture<FunctionKeysComponent>;
  let de: DebugElement;
  let broadcastService: BroadcastService;
  let translateService: TranslateService;
  let utilitiesService: UtilitiesService;
  let aiService: AiService;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionKeysComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    broadcastService = TestBed.get(BroadcastService);
    translateService = TestBed.get(TranslateService);
    utilitiesService = TestBed.get(UtilitiesService);
    aiService = TestBed.get(AiService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize state as expected', () => {
    expect(component['validKey']).toBeFalsy();
    expect(component.keys).toBeTruthy();
    expect(component['functionStream']).toBeTruthy();
    expect(component['functionAppStream']).toBeTruthy();
  });

});
