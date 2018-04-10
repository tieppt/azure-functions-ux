import { AppModule } from './../app.module';
/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';



import { FileExplorerComponent } from './file-explorer.component';

describe('FileExplorerComponent', () => {
  let component: FileExplorerComponent;
  let fixture: ComponentFixture<FileExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule(AppModule.moduleDefinition)
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
