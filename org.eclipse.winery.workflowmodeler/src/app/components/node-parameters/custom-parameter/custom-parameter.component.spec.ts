/**
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomParameterComponent } from './custom-parameter.component';

describe('CustomParameterComponent', () => {
    let component: CustomParameterComponent;
    let fixture: ComponentFixture<CustomParameterComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
                declarations: [CustomParameterComponent],
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
