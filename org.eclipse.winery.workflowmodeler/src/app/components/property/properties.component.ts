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

import { AfterViewInit, Component } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { PlanTreeviewItem } from '../../model/plan-treeview-item';
import { ValueSource } from '../../model/value-source.enum';
import { Parameter } from '../../model/workflow/parameter';
import { WorkflowNode } from '../../model/workflow/workflow-node';
import { WorkflowNodeType } from '../../model/workflow/workflow-node-type';
import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';

/**
 * property component presents information of a workflow node.
 * the presented information can be edit in this component.
 * it may load information dynamically. the content may be different for different node type.
 */
@Component({
    selector: 'b4t-properties',
    styleUrls: ['./properties.component.css'],
    templateUrl: 'properties.component.html',
})
export class PropertiesComponent implements AfterViewInit {
    public node: WorkflowNode;
    public planTreeviewItems: PlanTreeviewItem[];
    public nodeTypes: string[] = WorkflowNodeType;
    public show = false;
    public titleEditing = false;
    public valueSource = [ValueSource.String];

    public nameParameter = new Parameter('nodeName', '', ValueSource[ValueSource.String], '');

    constructor(private broadcastService: BroadcastService,
        private modelService: ModelService,
        private jsPlumbService: JsPlumbService) {

    }

    public ngAfterViewInit() {
        this.broadcastService.showProperty$.subscribe(show => this.show = show);
        this.broadcastService.nodeProperty$.subscribe(node => {
            this.node = node;
            this.planTreeviewItems = this.modelService.getPlanParameters(this.node.id);
            this.nameParameter.value = this.node.name;
        });
    }

    public nodeNameChange(nameParamter: Parameter) {
        this.titleEditing = !this.titleEditing;
        this.node.name = nameParamter.value;

        setTimeout(() => {
            this.jsPlumbService.jsplumbInstanceMap.get(this.node.parentId).repaintEverything();
        }, 0);
    }

    public deleteNode() {
        this.show = false;

        const parentId = this.jsPlumbService.getParentNodeId(this.node.id);
        this.jsPlumbService.remove(this.node);
        this.modelService.deleteNode(parentId, this.node.id);
    }
}
