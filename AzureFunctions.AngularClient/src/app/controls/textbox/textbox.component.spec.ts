import { AppModule } from './../../app.module';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';



import { TextboxComponent } from './textbox.component';

describe('TextboxComponent', () => {
  let component: TextboxComponent;
  let fixture: ComponentFixture<TextboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
