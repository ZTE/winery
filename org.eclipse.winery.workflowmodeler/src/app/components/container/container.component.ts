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

import {Component, AfterViewInit, AfterViewChecked} from '@angular/core';
import {BroadcastService} from "../../services/broadcast.service";
import {JsPlumbService} from "../../services/jsplumb.service";
import {NodeTemplate} from '../../model/nodetemplate';
import {ModelService} from "../../services/model.service";
import {WineryService} from "../../services/winery.service";

@Component({
    selector: 'wm-container',
    styleUrls: ['./container.component.css'],
    templateUrl: 'container.component.html',
})
export class WmContainerComponent implements AfterViewInit {


    constructor(private broadcastService:BroadcastService,
                private jsPlumbService:JsPlumbService,
                private modelService:ModelService,
                private wineryService:WineryService) {
        this.broadcastService.jsPlumbInstance$.subscribe(instance => this.jsPlumbService.buttonDroppable());
    }

    ngAfterViewInit() {
        this.jsPlumbService.initJsPlumbInstance();
    }


    canvasClick() {
        this.broadcastService.showProperty.next(false);
    }


}