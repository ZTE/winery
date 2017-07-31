import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomParameterComponent } from './custom-parameter.component';

describe('CustomParameterComponent', () => {
  let component: CustomParameterComponent;
  let fixture: ComponentFixture<CustomParameterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomParameterComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomParameterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
