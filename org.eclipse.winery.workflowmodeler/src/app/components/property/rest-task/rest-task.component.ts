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
import { RestTask } from '../../../model/workflow/rest-task';
import { RestParameter } from '../../../model/workflow/rest-parameter';
import { BroadcastService } from '../../../services/broadcast.service';
import { NotifyService } from '../../../services/notify.service';
import { RestService } from '../../../services/rest.service';
import { WorkflowUtil } from '../../../util/workflow-util';
import { ValueSource } from '../../../model/value-source.enum';
import { ValueType } from '../../../model/value-type.enum';

@Component({
    selector: 'b4t-rest-task',
    templateUrl: 'rest-task.component.html',
})
export class WmRestTaskComponent implements AfterViewInit {
    @Input() public node: RestTask;
    public swaggerJson: any = {};
    public restInterfaces: any[];
    public restOperations: any = [];
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

    public serviceChanged(swagger: string) {
        this.node.swagger = swagger;
        this.urlChanged('');
        this.loadInterfaces();
    }

    public urlChanged(url: string) {
        this.node.url = url;

        this.node.consumes = [];
        this.node.produces = [];
        this.methodChanged('');

        this.loadOperations();
    }

    public methodChanged(method: string) {
        this.node.method = method;

        this.node.parameters = [];
        this.node.responses = [];

        this.notifyTaskChanged();

        this.updateMethodInfo();
    }

    private notifyTaskChanged() {
        this.broadcastService.broadcast(this.broadcastService.nodeTaskChange, null);
    }

    private loadInterfaces() {
        if (this.node.swagger) {
            this.swagger = this.restService.getSwaggerInfo(this.node.swagger);

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
        if (this.node.url) {
            const swaggerPath: any = this.swagger.paths[this.node.url];

            this.restOperations = [];
            for (const key of Object.keys(swaggerPath)) {
                this.restOperations.push(key);
            }
        }
    }

    private updateMethodInfo() {
        if (this.node.method) {
            const path: any = this.swagger.paths[this.node.url];
            const method: SwaggerMethod = path[this.node.method];

            this.node.consumes = WorkflowUtil.deepClone(method.consumes);
            this.node.produces = WorkflowUtil.deepClone(method.produces);

            method.parameters.forEach(param => {
                //const nodeParam = new Parameter(param.name, '', ValueSource[ValueSource.String], param.type);
                const nodeParam = new RestParameter(param.name, '', ValueSource[ValueSource.String],
                    ValueType[ValueType.String], param.position, param.schema);
                this.node.parameters.push(nodeParam);
            });

            const responseParams = this.restService.getResponseParameters(
                this.swagger, this.node.url, this.node.method);
            this.node.responses = responseParams.map(param => WorkflowUtil.deepClone(param));

            this.notifyTaskChanged();
        }
    }
}