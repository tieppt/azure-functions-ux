import { AppModule } from './app.module';

import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('App: AzureFunctionsClient', () => {
  beforeEach(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition);
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  }));
});
