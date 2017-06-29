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
import { AfterViewInit, Component, Input } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { Swagger, SwaggerMethod, SwaggerParameter, SwaggerResponse } from '../../../model/swagger';
import { WorkflowNode } from '../../../model/workflow.node';
import { BroadcastService } from '../../../services/broadcast.service';
import { NotifyService } from '../../../services/notify.service';
import { RestService } from '../../../services/rest.service';
import { WineryService } from '../../../services/winery.service';

@Component({
    selector: 'b4t-rest-task',
    templateUrl: 'rest-task.component.html',
})
export class WmRestTaskComponent implements AfterViewInit {
    @Input()
    public node: WorkflowNode;

    private swaggerJson: any = {};
    private restInterfaces: any[];
    private restOperations: any = [];
    private swagger: Swagger;

    constructor(private broadcastService: BroadcastService,
                private notifyService: NotifyService,
                private restService: RestService) {

    }

    public ngAfterViewInit() {
        setTimeout(() => {
            this.loadInterfaces();
            this.notifyTaskChanged();
        }, 0);
    }

    public serviceChanged() {
        this.node.nodeTemplate = this.node.template.id;

        this.node.template.interface = '';
        this.interfaceChanged();

        this.loadInterfaces();
    }

    public interfaceChanged() {
        this.node.nodeInterface = this.node.template.interface;
        this.node.template.operation = '';
        this.operationChanged();

        this.loadOperations();
    }

    public operationChanged() {
        this.node.nodeOperation = this.node.template.operation;
        this.node.input = [];
        this.node.output = [];

        this.notifyTaskChanged();

        this.loadParameters();
    }

    private notifyTaskChanged() {
        this.broadcastService.broadcast(this.broadcastService.nodeTaskChange, null);
    }

    private loadInterfaces() {
        if (this.node.nodeTemplate) {
            this.swagger = this.restService.getSwaggerInfo(this.node.nodeTemplate);

            if (this.swagger) {
                this.restInterfaces = [];
                for (const key of Object.keys(this.swagger.paths)) {
                    this.restInterfaces.push(key);
                }
                this.loadOperations();
            } else {
                this.notifyService.error('swagger info not specified, please set swagger info first');
            }
        }
    }

    private loadOperations() {
        if (this.node.nodeInterface) {
            const swaggerPath: any = this.swagger.paths[this.node.nodeInterface];

            this.restOperations = [];
            for (const key of Object.keys(swaggerPath)) {
                this.restOperations.push(key);
            }
        }
    }

    private loadParameters() {
        if (this.node.nodeOperation) {
            const path: any = this.swagger.paths[this.node.nodeInterface];
            const method: SwaggerMethod = path[this.node.nodeOperation];

            this.node.input = method.parameters.map(param => this.restService.deepClone(param));

            const responseParams = this.restService.getResponseParameters(
                this.swagger, this.node.nodeInterface, this.node.nodeOperation);
            this.node.output = responseParams.map(param => this.restService.deepClone(param));

            this.notifyTaskChanged();
        }
    }
}
