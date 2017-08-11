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

import { PlanTreeviewItem } from '../../model/plan-treeview-item';
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
    @Input() public planItems: PlanTreeviewItem[];
    @Output() delete: EventEmitter<Parameter> = new EventEmitter<Parameter>();

    public sourceEnum = ValueSource;
    public valueGroupClass;
    public valueClass;
    public planOptions = [];
    public topologyOptions = [];
    public showValueSource: boolean = true;

    constructor(private dataService: DataService) { }

    public ngOnInit(): void {
        if (1 === this.valueSource.length) {
            this.showValueSource = false;
        }
        this.topologyOptions = this.dataService.service.getAllNodesProperties();
        this.valueClass = {
            'col-md-9': this.showValueSource,
            'col-md-12': !this.showValueSource
        };

        this.valueGroupClass = {
            'col-md-7': this.canDelete,
            'col-md-9': !this.canDelete
        };
        // trans plan options to tree view items.
        this.initPlanTreeviewItems(this.planItems);
    }

    public resetValue(): void {
        this.param.value = '';
    }

    public deleteParam(): void {
        this.delete.emit();
    }

    public treeviewSelectedChange(values) {
        if (0 === values.length) {
            return;
        } else if (1 === values.length) {
            this.param.value = values[0];
        } else {
            this.param.value = values[1];

        }
        console.log('select object is:' + values);
        // this.treeviewItems[0].collapsed()
    }

    private initPlanTreeviewItems(planResponses: PlanTreeviewItem[]): void {
        this.planOptions = this.getTreeviewChild(planResponses);
    }

    private getTreeviewChild(planTreeviewItems: PlanTreeviewItem[]): any[] {
        let treeviewItems = [];
        if (undefined == planTreeviewItems || 0 === planTreeviewItems.length) {
            // todo: debug check if it need [] or undefined.
            return treeviewItems;
        }
        planTreeviewItems.forEach(item => {
            const treeviewItem = {
                id: item.value, name: item.name, disabled: false,//!item.canSelect,
                children: this.getTreeviewChild(item.children)
            };
            treeviewItems.push(treeviewItem);
        })
        return treeviewItems;
    }
}
