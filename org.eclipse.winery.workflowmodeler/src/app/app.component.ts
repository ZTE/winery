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

import { Component, AfterViewInit } from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Params} from '@angular/router';
import {Observable} from "rxjs/Observable";
import {WineryService} from "./services/winery.service";
import {JsPlumbService} from "./services/jsplumb.service";
import {BroadcastService} from "./services/broadcast.service";

@Component({
    selector: 'my-app',
    templateUrl: 'app.component.html',
})
export class AppComponent implements AfterViewInit {
    constructor(private route:ActivatedRoute,
                private wineryService:WineryService) {

    }

    ngOnInit() {
        this.route.queryParams.subscribe(
            params =>
                this.wineryService.setRequestParam(params)
        );
    }

    ngAfterViewInit() {

    }


}
