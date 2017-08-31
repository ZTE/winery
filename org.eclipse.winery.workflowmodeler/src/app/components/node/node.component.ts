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
import { AfterViewInit, Component, Input, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { SubProcess } from '../../model/workflow/sub-process';
import { WorkflowNode } from '../../model/workflow/workflow-node';
import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';

/**
 * node component represent a single workflow node.
 * every node would be rendered on the container component
 */
@Component({
    selector: 'b4t-node',
    styleUrls: ['./node.component.css'],
    templateUrl: 'node.component.html',
})
export class NodeComponent implements AfterViewInit, OnDestroy {
    @Input() public last: boolean;
    @Input() public node: WorkflowNode;
    @Input() public rank: number;
    public active = false;
    private currentTypeSubscription: Subscription;
    private currentWorkflowSubscription: Subscription;

    constructor(private jsPlumbService: JsPlumbService,
                private modelService: ModelService,
                private broadcastService: BroadcastService) {
    }

    public ngAfterViewInit() {
        this.jsPlumbService.initJsPlumbInstance(this.node.parentId);
        this.jsPlumbService.initNode(this.node);

        if (this.canHaveChildren()) {
            this.jsPlumbService.nodeDroppable(this.node, this.rank);
            this.jsPlumbService.connectChildrenNodes(this.node.id);
        }
        if (this.last && this.node.parentId === this.modelService.rootNodeId) {
            this.jsPlumbService.connectChildrenNodes(this.modelService.rootNodeId);
        }

        this.currentTypeSubscription = this.broadcastService.currentType$.subscribe(type => {
            if (type === 'SequenceFlow') {
                this.active = false;
            }
        });

        this.currentWorkflowSubscription = this.broadcastService.currentWorkflowNode$.subscribe(activeNode => {
            if (activeNode.id === this.node.id) {
                this.active = true;
            } else {
                this.active = false;
            }
        });
    }

    public ngOnDestroy() {
        this.currentTypeSubscription.unsubscribe();
        this.currentWorkflowSubscription.unsubscribe();
    }

    public onSelected() {
        this.broadcastService.broadcast(this.broadcastService.currentWorkflowNode, this.node);
        this.broadcastService.broadcast(this.broadcastService.currentType, 'WorkflowNode');
    }

    public canHaveChildren(): boolean {
        return this.node.type === 'subProcess';
    }

    public onMouseOut(event, target) {
        event.stopPropagation();
        target.classList.remove('hover');
    }

    public onMouseOver(event, target) {
        event.stopPropagation();
        target.classList.add('hover');
    }

    public showProperties(event) {
        event.stopPropagation();
        this.broadcastService.broadcast(this.broadcastService.nodeProperty, this.node);
        this.broadcastService.broadcast(this.broadcastService.showProperty, true);
    }

    public getDisplayName(): string {
        if (this.node.type === 'restTask' || this.node.type === 'toscaNodeManagementTask') {
            return this.node.name;
        } else {
            return '     ';
        }
    }

}
