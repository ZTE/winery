/*******************************************************************************
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 *******************************************************************************/
import { Component, Input, ViewChild } from '@angular/core';

import { StartEvent } from '../../../model/workflow/start-event';
import { CustomParameterComponent } from '../../node-parameters/custom-parameter/custom-parameter.component';
import {Parameter} from '../../../model/workflow/parameter';

@Component({
    selector: 'b4t-start-event-parameters',
    templateUrl: 'start-event-parameters.component.html',
})
export class StartEventParametersComponent {
    @Input() public node: StartEvent;
    @ViewChild('customParameterComponent') public customParameterComponent: CustomParameterComponent;

    public parameterChanges(parameters: Parameter[]): void {
        this.node.parameters = parameters;
    }
}
