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
import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { Parameter } from '../../../model/workflow/parameter';
import { WorkflowUtil } from '../../../util/workflow-util';

@Component({
    selector: 'b4t-custom-parameter',
    templateUrl: './custom-parameter.component.html',
    styleUrls: ['./custom-parameter.component.css'],
})
export class CustomParameterComponent implements OnInit {
    @ViewChild('customParameterModal') public customParameterModal: ModalDirective;
    @Output() updateParams: EventEmitter<Parameter[]> = new EventEmitter();
    public parameters: Parameter[] = [];
    public paramTypes: string[] = ['string'];

    constructor() {
    }

    public ngOnInit() {
    }

    public create(): void {
        const newParam = new Parameter();
        newParam.name = '';
        newParam.type = this.paramTypes[0];
        this.parameters.push(newParam);
    }

    public isEmpty(name: string): boolean {
        if (name && '' !== name) {
            return false;
        } else {
            return true;
        }
    }

    public hasSame(parameter: Parameter): boolean {
        for (const param of this.parameters) {
            if (param !== parameter && param.name === parameter.name) {
                return true;
            }
        }
        return false;
    }

    public delete(index: number): void {
        this.parameters.splice(index, 1);
    }

    public ok(): void {
        this.updateParams.emit(this.parameters);
        this.customParameterModal.hide();
    }

    public close(): void {
        this.customParameterModal.hide();
    }

    public show(parameters: Parameter[]): void {
        if (parameters) {
            this.parameters = WorkflowUtil.deepClone(parameters);
        } else {
            this.parameters = [];
        }
        this.customParameterModal.show();
    }
}
