import { AppModule } from './../app.module';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';



import { TryNowBusyStateComponent } from './try-now-busy-state.component';

describe('TryNowBusyStateComponent', () => {
  let component: TryNowBusyStateComponent;
  let fixture: ComponentFixture<TryNowBusyStateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TryNowBusyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
