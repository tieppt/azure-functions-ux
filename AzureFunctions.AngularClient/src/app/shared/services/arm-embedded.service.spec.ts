import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { ArmEmbeddedService } from './arm-embedded.service';

describe('Service: Arm', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([ArmEmbeddedService], (service: ArmEmbeddedService) => {
    expect(service).toBeTruthy();
  }));
});
