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
import { WineryService } from '../../services/winery.service';

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
    @Input() public canEdit: boolean;
    @Output() delete: EventEmitter<Parameter> = new EventEmitter<Parameter>();

    public sourceEnum = ValueSource;
    public planOptions: string[] = [];
    public topologyOptions: string[];

    public constructor(public wineryService: WineryService) { }

    public ngOnInit(): void {
        if (undefined === this.param.valueSource) {
            this.param.valueSource = this.sourceEnum[this.valueSource[0]];
        }
        this.topologyOptions = this.wineryService.getAllNodesProperties();
    }

    public resetValue(): void {
        this.param.value = '';
    }

    public deleteParam(): void {
        this.delete.emit();
    }
}
