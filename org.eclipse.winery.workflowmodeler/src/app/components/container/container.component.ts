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
    public allNotes: WorkflowNode[];
    private currentWorkflowNode: WorkflowNode;
    private currentSequenceFlow: SequenceFlow;
    private currentType: string;
    private showNode: boolean = false;
    private showSequence: boolean = false;

    constructor(private broadcastService: BroadcastService, private jsPlumbService: JsPlumbService,
        private dataService: DataService, public modelService: ModelService) {
    }

    @HostListener('window:keyup.delete', ['$event']) ondelete(event: KeyboardEvent) {
        if (this.showNode || this.showSequence) {
            return;
        }
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
        this.jsPlumbService.initJsPlumbInstance(this.modelService.rootNodeId);
        this.broadcastService.backendServiceReady$.subscribe(() => {
            this.dataService.initData();
        });
        this.broadcastService.showProperty$.subscribe(show => this.showNode = show);
        this.broadcastService.showSequenceFlow$.subscribe(show => this.showSequence = show);
    }

    public ngAfterViewInit() {
        // Add the connection
        this.broadcastService.planModel$.subscribe(() => {
            this.jsPlumbService.connectChildrenNodes(this.modelService.rootNodeId);
        })
        this.jsPlumbService.buttonDroppable();
        this.jsPlumbService.canvasDroppable();
        this.broadcastService.currentSequenceFlow$.subscribe(sequenceFlow => {
            this.currentSequenceFlow = sequenceFlow;
        });
        this.broadcastService.currentWorkflowNode$.subscribe(workflowNode => {
            this.currentWorkflowNode = workflowNode;
        });
        this.broadcastService.currentType$.subscribe(type => this.currentType = type);
    }

    public canvasClick() {
        this.broadcastService.broadcast(this.broadcastService.showProperty, false);
        this.broadcastService.broadcast(this.broadcastService.showSequenceFlow, false);
    }
}
