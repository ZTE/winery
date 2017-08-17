import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalNoticeComponent } from './global-notice.component';

describe('GlobalNoticeComponent', () => {
  let component: GlobalNoticeComponent;
  let fixture: ComponentFixture<GlobalNoticeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalNoticeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalNoticeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
