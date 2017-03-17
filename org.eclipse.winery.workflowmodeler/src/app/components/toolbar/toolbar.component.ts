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

import {Component, AfterViewInit} from '@angular/core';
import {WineryService} from "../../services/winery.service";
import {JsPlumbService} from "../../services/jsplumb.service";
import {BroadcastService} from "../../services/broadcast.service";
import {ModelService} from "../../services/model.service";
import {WorkflowNodeType} from "../../model/workflow.node";


@Component({
    selector: 'wm-toolbar',
    styleUrls: ['./toolbar.component.css'],
    templateUrl: 'toolbar.component.html',
})
export class WmToolbarComponent implements AfterViewInit {
    isCollapsed = false;
    private nodeTypes = WorkflowNodeType;

    constructor(private wineryService:WineryService,
                private modelSerivce:ModelService,
                private jsPlumbService:JsPlumbService,
                private broadcastSerice:BroadcastService) {
        this.broadcastSerice.jsPlumbInstance$.subscribe(instance => this.jsPlumbService.buttonDraggable());
    }

    ngAfterViewInit() {
    }


    toggleCollapse = function () {
        this.isCollapsed = !this.isCollapsed;
    }

    loadIA() {
        //this.wineryService.getAllImplementationArtifacts();
    }

    getNodeTemplates() {
        this.wineryService.loadNodeTemplates();
    }

    getInterfaces() {
        //this.wineryService.loadNodeTemplateInterfaces(null);
    }

    getOperations() {
        //this.wineryService.loadNodeTemplateOperations(null, null);
    }

    getParams() {
        //this.wineryService.loadNodeTemplateOperationParameter(null, null, null);
    }

    getProperties() {
        this.wineryService.loadTopologyProperties(null);
    }

    save() {
        this.modelSerivce.save();
    }
}