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

import {Component, Input, AfterViewInit } from '@angular/core';
import {BroadcastService} from "../../services/broadcast.service";
import {ModelService} from "../../services/model.service";
import {JsPlumbService} from "../../services/jsplumb.service";
import {WorkflowNodeType} from "../../model/workflow.node";

@Component({
    selector: 'wm-properties',
    styleUrls: ['./properties.component.css'],
    templateUrl: 'properties.component.html',
})
export class WmPropertiesComponent implements AfterViewInit {
    private nodeTypes = WorkflowNodeType;
    show:boolean = false;
    node:any;

    constructor(private broadcastService:BroadcastService,
                private modelService:ModelService,
                private jsPlumnService:JsPlumbService) {

    }

    ngAfterViewInit() {
        this.broadcastService.showProperty$.subscribe(show => this.show = show);
        this.broadcastService.nodeProperty$.subscribe(node => this.node = node);
    }

    titleEditing:any = false;

    addNewParam = function () {
        alert("add new Param");
    }

    nodeNameChanged() {
        this.titleEditing = !this.titleEditing;
        this.jsPlumnService.jsplumbInstance.repaintEverything();
    }

    deleteNode() {
        this.show = false;

        this.jsPlumnService.remove(this.node.id);
        this.modelService.deleteNode(this.node.id);
    }
}