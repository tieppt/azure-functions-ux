import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('Service: Language', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should ...', inject([LanguageService], (service: LanguageService) => {
    expect(service).toBeTruthy();
  }));
});
