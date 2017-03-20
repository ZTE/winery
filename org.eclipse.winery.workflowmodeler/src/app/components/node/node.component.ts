/*******************************************************************************
 * Copyright (c) 2017 ZTE Corporation.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * and the Apache License 2.0 which both accompany this distribution,
 * and are available at http://www.eclipse.org/legal/epl-v10.html
 * and http://www.apache.org/licenses/LICENSE-2.0
 *
 * Contributors:
 *     ZTE - initial API and implementation and/or initial documentation
 *******************************************************************************/
import {Component, Input, AfterViewInit, OnDestroy} from '@angular/core';
import {JsPlumbService} from "../../services/jsplumb.service";
import {BroadcastService} from "../../services/broadcast.service";

import {WorkflowNode} from '../../model/workflow.node';
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'wf-node',
    styleUrls: ['./node.component.css'],
    templateUrl: 'node.component.html',
})
export class WmNodeComponent implements AfterViewInit, OnDestroy {
    @Input()
    node:WorkflowNode;
    @Input()
    last:boolean;

    selected:boolean = false;

    private jsPlumbInstanceSubscription:Subscription;
    private nfForJsPlumbInstanceSubscription:Subscription;

    constructor(private jsPlumbService:JsPlumbService,
                private broadcastService:BroadcastService) {
    }

    ngAfterViewInit() {
        if (this.jsPlumbService.jsplumbInstance) {
            this.jsPlumbService.initNode(this.node);
        } else {
            this.jsPlumbInstanceSubscription = this.broadcastService.jsPlumbInstance$.subscribe(
                instance => this.jsPlumbService.initNode(this.node)
            );
        }

        if (this.last) {
            /**
             * this will call jsplumb to connect all connections after the last node was rendered
             * if calls call these method before all of the nodes are rendered, there will a source or target not found error
             */
            if (this.jsPlumbService.jsplumbInstance) {
                this.jsPlumbService.connectNode();
            } else {
                this.nfForJsPlumbInstanceSubscription = this.broadcastService.jsPlumbInstance$.subscribe(
                    instance => this.jsPlumbService.connectNode()
                );
            }
        }
    }

    ngOnDestroy() {
        if (this.jsPlumbInstanceSubscription) {
            this.jsPlumbInstanceSubscription.unsubscribe();
        }

        if (this.nfForJsPlumbInstanceSubscription) {
            this.nfForJsPlumbInstanceSubscription.unsubscribe();
        }
    }

    showProperties() {
        this.broadcastService.nodeProperty.next(this.node);
        this.broadcastService.showProperty.next(true);
    }
}