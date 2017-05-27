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

import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {RestService} from '../../../../services/rest.service';
import {Swagger} from '../../../../model/swagger';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-rest-config-detail',
    templateUrl: 'rest-config-detail.component.html',
})
export class WmRestConfigDetailComponent implements OnChanges{
    @Input() restConfig: {
        name: string,
        baseUrl: string,
        swagger: Swagger,
    };

    public detail: string;

    constructor() {

    }

    public ngOnChanges() {
        if(this.restConfig.swagger) {
            this.detail = JSON.stringify(this.restConfig.swagger);
        } else {
            this.detail = '';
        }
    }

    public onDetailChanged(detail: any) {
        this.detail = detail;

        let swagger: Swagger = null;
        try {
            swagger = new Swagger(JSON.parse(detail));
            console.log(swagger);
        } catch(e) {
            console.log("detail transfer error");
            console.error(e);
        }
        this.restConfig.swagger = swagger;
    }


}
