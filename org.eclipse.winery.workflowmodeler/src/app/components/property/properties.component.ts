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

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { CustomParameterComponent } from '../node-parameters/custom-parameter/custom-parameter.component';
import { Parameter } from '../../model/workflow/parameter';
import { WorkflowNode } from '../../model/workflow/workflow-node';
import { WorkflowNodeType } from '../../model/workflow/workflow-node-type';
import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';
import { StartEvent } from '../../model/workflow/start-event';

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
export class WmPropertiesComponent implements AfterViewInit {
    @ViewChild('customParameterComponent') public customParameterComponent: CustomParameterComponent;
    public node: WorkflowNode;
    public nodeTypes: string[] = WorkflowNodeType;
    public customParams: Parameter[] = [];
    public show = false;
    public titleEditing = false;

    constructor(private broadcastService: BroadcastService,
        private modelService: ModelService,
        private jsPlumbService: JsPlumbService) {

    }

    public ngAfterViewInit() {
        this.broadcastService.showProperty$.subscribe(show => this.show = show);
        this.broadcastService.nodeProperty$.subscribe(node => {
            this.node = node;
            if ('startEvent' === node.type) {
                this.customParams = (node as StartEvent).customParams;
            } else {
                this.customParams = [];
            }
        });
    }

    public nodeNameChanged() {
        this.titleEditing = !this.titleEditing;
        this.jsPlumbService.jsplumbInstanceMap.get(this.node.parentId).repaintEverything();
    }

    public deleteNode() {
        this.show = false;

        const parentId = this.jsPlumbService.getParentNodeId(this.node.id);
        this.jsPlumbService.remove(this.node);
        this.modelService.deleteNode(parentId, this.node.id);
    }

    public updateParams(parameters: Parameter[]): void {
        this.customParams = parameters;
        (this.node as StartEvent).customParams = this.customParams;
    }
}
