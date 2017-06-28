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
import { AfterViewInit, Component, Input } from '@angular/core';
import { WorkflowNode } from '../../model/workflow.node';
import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';

/**
 * node component represent a single workflow node.
 * every node would be rendered on the container component
 */
@Component({
    selector: 'b4t-node',
    styleUrls: ['./node.component.css'],
    templateUrl: 'node.component.html',
})
export class WmNodeComponent implements AfterViewInit {
    @Input() public node: WorkflowNode;
    @Input() public rank: number;

    constructor(private jsPlumbService: JsPlumbService,
                private broadcastService: BroadcastService) {
    }

    public ngAfterViewInit() {
        this.jsPlumbService.initNode(this.node);

        if (this.node.canHaveChildren()) {
            this.jsPlumbService.nodeDroppable(this.node, this.rank);
            this.jsPlumbService.initJsPlumbInstance(this.node.id);
            this.jsPlumbService.connectNode(this.node.children);
        }
    }

    public onMouseOut(event, target) {
        event.stopPropagation();
        target.classList.remove('active');
    }

    public onMouseOver(event, target) {
        event.stopPropagation();
        target.classList.add('active');
    }

    public showProperties(event) {
        event.stopPropagation();
        this.broadcastService.broadcast(this.broadcastService.nodeProperty, this.node);
        this.broadcastService.broadcast(this.broadcastService.showProperty, true);
    }

}
