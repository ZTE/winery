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
import { WorkflowNodeType } from '../../model/workflow.node';
import { BroadcastService } from '../../services/broadcast.service';
import { JsPlumbService } from '../../services/jsplumb.service';
import { ModelService } from '../../services/model.service';
import { WineryService } from '../../services/winery.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {RestService} from '../../services/rest.service';
import {WmRestConfigComponent} from './restconfig/rest-config.component';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-toolbar',
    styleUrls: ['./toolbar.component.css'],
    templateUrl: 'toolbar.component.html',
})
export class WmToolbarComponent implements AfterViewInit {
    public nodeTypes = WorkflowNodeType;

    @ViewChild(WmRestConfigComponent) public restConfigComponent: WmRestConfigComponent;

    constructor(private jsPlumbService: JsPlumbService,
                private modelService: ModelService,
                private broadcastService: BroadcastService) {
        this.broadcastService.jsPlumbInstance$
            .subscribe(instance => this.jsPlumbService.buttonDraggable());
    }

    public ngAfterViewInit() {
    }

    public save() {
        this.modelService.save();
    }

    public showRestConfigModal() {
        this.restConfigComponent.show();
    }
}
