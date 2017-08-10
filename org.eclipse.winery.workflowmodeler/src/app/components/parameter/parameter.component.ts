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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { ValueSource } from '../../model/value-source.enum';
import { Parameter } from '../../model/workflow/parameter';
import { DataService } from '../../services/data/data.service';

/**
 * this component contains in property component if the corresponding node has parameter properties
 * eg. task node have input and output params, start event node has input param
 */
@Component({
    selector: 'b4t-parameter',
    styleUrls: ['./parameter.component.css'],
    templateUrl: 'parameter.component.html',
})
export class WmParameterComponent implements OnInit {
    @Input() public param: Parameter;
    @Input() public valueSource: ValueSource[];
    @Input() public canEditName: boolean;
    @Input() public showLabel = true;
    @Input() public canDelete: boolean;
    @Output() delete: EventEmitter<Parameter> = new EventEmitter<Parameter>();

    public sourceEnum = ValueSource;
    public planOptions: string[] = [];
    public topologyOptions: string[];
    public valueClass;
     public showValueSource = true;

    public constructor(public dataService: DataService) {
    }

    public ngOnInit(): void {
        if (1 === this.valueSource.length) {
            this.showValueSource = false;
        }
        this.topologyOptions = this.dataService.service.getAllNodesProperties();
        this.valueClass = {
            'col-md-7': this.canDelete,
            'col-md-9': !this.canDelete,
        };
    }

    public resetValue(): void {
        this.param.value = '';
    }

    public deleteParam(): void {
        this.delete.emit();
    }
}
