import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';



import { FunctionRuntimeComponent } from './function-runtime.component';

describe('FunctionRuntimeComponent', () => {
  let component: FunctionRuntimeComponent;
  let fixture: ComponentFixture<FunctionRuntimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FunctionRuntimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
