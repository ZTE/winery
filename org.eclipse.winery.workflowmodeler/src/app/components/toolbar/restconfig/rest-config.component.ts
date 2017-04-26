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

import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import {RestService} from '../../../services/rest.service';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-rest-config',
    templateUrl: 'rest-config.component.html',
})
export class WmRestConfigComponent {
    @ViewChild('restConfigModal') public restConfigModal: ModalDirective;

    public name: string = '';
    public baseUrl: string = '';
    public detail = '';

    constructor(private restService: RestService) {

    }

    public confirmServiceResources() {
        this.restService.setSwaggers([{
            name: this.name,
            baseUrl: this.baseUrl,
            swagger:JSON.parse(this.detail)
        }]);
        this.restConfigModal.hide();
    }

    public show() {
        this.restConfigModal.show();
    }

}
