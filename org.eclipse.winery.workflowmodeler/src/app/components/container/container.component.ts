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

import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SequenceFlow } from '../../model/workflow/sequence-flow';
import { WorkflowNode } from '../../model/workflow/workflow-node';
import { BroadcastService } from '../../services/broadcast.service';
import { DataService } from '../../services/data/data.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';

/**
 * main canvas, it contains two parts: canvas and node property component
 * bpmn task nodes can be dropped into this canvas, and then the workflow can be edit
 */
@Component({
    selector: 'b4t-container',
    templateUrl: 'container.component.html',
    styleUrls: ['./container.component.css']
})
export class ContainerComponent implements AfterViewInit, OnInit {
    public currentWorkflowNode: WorkflowNode;
    public currentSequenceFlow: SequenceFlow;
    public currentType: string;

    constructor(private broadcastService: BroadcastService,
                private route: ActivatedRoute,
                private jsPlumbService: JsPlumbService,
                private dataService: DataService,
                public modelService: ModelService) {
    }

    @HostListener('window:keyup.delete', ['$event']) ondelete(event: KeyboardEvent) {
        if (this.currentType === 'WorkflowNode') {
            const parentId = this.jsPlumbService.getParentNodeId(this.currentWorkflowNode.id);
            this.jsPlumbService.remove(this.currentWorkflowNode);
            this.modelService.deleteNode(parentId, this.currentWorkflowNode.id);
        } else if (this.currentType === 'SequenceFlow') {
            this.modelService.deleteConnection(this.currentSequenceFlow.sourceRef, this.currentSequenceFlow.targetRef);
            this.jsPlumbService.deleteConnect(this.currentSequenceFlow.sourceRef, this.currentSequenceFlow.targetRef);
        }
    }

    public ngOnInit() {
        this.route.queryParams.subscribe(queryParams => {
            this.dataService.initData(queryParams);
        });
        this.jsPlumbService.initJsPlumbInstance(this.modelService.rootNodeId);
    }

    public ngAfterViewInit() {
        this.jsPlumbService.buttonDroppable();
        this.jsPlumbService.canvasDroppable();
        this.broadcastService.currentSequenceFlow$.subscribe(sequenceFlow => this.currentSequenceFlow = sequenceFlow);
        this.broadcastService.currentWorkflowNode$.subscribe(workflowNode => this.currentWorkflowNode = workflowNode);
        this.broadcastService.currentType$.subscribe(type => this.currentType = type);
    }

    public canvasClick() {
        this.broadcastService.broadcast(this.broadcastService.showProperty, false);
        this.broadcastService.broadcast(this.broadcastService.showSequenceFlow, false);
    }
}
