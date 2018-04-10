import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SidepanelExampleComponent } from './sidepanel-example.component';
import { SidebarModule } from 'ng-sidebar';
import { HighlightService } from '../highlight.service';

describe('SidepanelExampleComponent', () => {
  let component: SidepanelExampleComponent;
  let fixture: ComponentFixture<SidepanelExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SidebarModule],
      providers: [HighlightService],
      declarations: [SidepanelExampleComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidepanelExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
