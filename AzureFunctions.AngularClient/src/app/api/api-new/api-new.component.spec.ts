import { AppModule } from '../../app.module';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ApiNewComponent } from './api-new.component';

describe('ApiNewComponent', () => {
  let component: ApiNewComponent;
  let fixture: ComponentFixture<ApiNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApiNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
