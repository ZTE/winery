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
import { TreeviewConfig, TreeItem, TreeviewItem } from 'ngx-treeview';

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
    @Input() public canDelete: boolean;
    @Output() delete: EventEmitter<Parameter> = new EventEmitter<Parameter>();

    public sourceEnum = ValueSource;
    public valueClass;
    public topologyOptions: [];
    public treeviewConfig = TreeviewConfig.create({
        hasAllCheckBox: false,
        hasFilter: true,
        hasCollapseExpand: true,
        maxHeight: 300
    });
    public treeviewItems: TreeviewItem[] = [];
    // public showValueSource: boolean = true;

    public constructor(public dataService: DataService) { }

    public ngOnInit(): void {
        // if (1 === this.valueSource.length) {
        //     this.showValueSource = false;
        // }
        this.topologyOptions = this.dataService.service.getAllNodesProperties();
        this.valueClass = {
            'col-md-7': this.canDelete,
            'col-md-9': !this.canDelete
        };
        // TODO: call service function to get plan options
        const planOptions: PlanTreeviewItem[] = [];
        // trans plan options to tree view items.
        this.initPlanTreeviewItems(planOptions, this.param.value);
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

    private initPlanTreeviewItems(planResponses: PlanTreeviewItem[], value: string): void {
        // const items = this.getTreeviewChild(planResponses, value);
        const item = new TreeviewItem({
            text: 'IT', value: 9, children: [
                {
                    text: 'Programming', value: 91, children: [{
                        text: 'Frontend', value: 911, children: [
                            { text: 'Angular 1', value: 9111, checked: false },
                            { text: 'Angular 2', value: 9112, checked: false },
                            { text: 'ReactJS', value: 9113, checked: false }
                        ]
                    }, {
                        text: 'Backend', value: 912, checked: false, children: [
                            { text: 'C#', value: 9121, checked: false },
                            { text: 'Java', value: 9122, checked: false },
                            { text: 'Python', value: 9123, checked: false }
                        ]
                    }]
                },
                {
                    text: 'Networking', value: 92, children: [
                        { text: 'Internet', value: 921, checked: false },
                        { text: 'Security', value: 922, checked: false, disabled: true }
                    ]
                }
            ]
        });
        // item.setCheckedRecursive(true);
        this.treeviewItems.push(item);
    }

    private getTreeviewChild(planTreeviewItems: PlanTreeviewItem[], value: string): TreeviewItem[] {
        let treeviewItems: TreeviewItem[] = [];
        if (undefined == planTreeviewItems || 0 === planTreeviewItems.length) {
            // todo: debug check if it need [] or undefined.
            return treeviewItems;
        }
        planTreeviewItems.forEach(item => {
            const treeviewItem = new TreeviewItem({
                text: item.name, value: item.value, checked: item.value == value, disabled: !item.canSelect,
                children: this.getTreeviewChild(item.children, value) });
            treeviewItems.push(treeviewItem);
        })
        return treeviewItems;
    }
}
