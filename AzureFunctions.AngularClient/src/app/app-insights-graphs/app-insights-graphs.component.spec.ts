import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AppInsightsGraphsComponent } from './app-insights-graphs.component';

describe('AppInsightsGraphsComponent', () => {
  let component: AppInsightsGraphsComponent;
  let fixture: ComponentFixture<AppInsightsGraphsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AppInsightsGraphsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppInsightsGraphsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
