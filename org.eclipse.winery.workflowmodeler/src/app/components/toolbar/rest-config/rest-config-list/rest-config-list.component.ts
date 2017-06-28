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

import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';

import { RestService } from '../../../../services/rest.service';
import { Swagger } from '../../../../model/swagger';

/**
 * toolbar component contains some basic operations(save) and all of the supported workflow nodes.
 * The supported nodes can be dragged to container component. which will add a new node to the workflow.
 */
@Component({
    selector: 'b4t-rest-config-list',
    templateUrl: 'rest-config-list.component.html',
})
export class WmRestConfigListComponent {
    @Output() configSelected = new EventEmitter<any>();

    constructor(public restService: RestService) {
    }

    public onConfigSelected(restConfig: any) {
        this.configSelected.emit(restConfig);
    }

    public addRestConfig() {
        let restConfig = {
            name: 'new Rest Config',
            baseUrl: '',
            dynamic: false,
        };
        this.restService.getRestConfigs().push(restConfig);

        this.onConfigSelected(restConfig);
    }

    public deleteRestConfig(index: number) {
        this.restService.getRestConfigs().splice(index, 1);

        let restConfig = {};
        if (this.restService.getRestConfigs().length > 0) {
            if (this.restService.getRestConfigs()[index]) {
                restConfig = this.restService.getRestConfigs()[index];
            } else {
                restConfig = this.restService.getRestConfigs()[index - 1];
            }
        }
        this.onConfigSelected(restConfig);
    }
}
