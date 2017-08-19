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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { PlanTreeviewItem } from '../../model/plan-treeview-item';
import { Swagger } from '../../model/swagger';
import { ValueSource } from '../../model/value-source.enum';
import { RestTask } from '../../model/workflow/rest-task';
import { BroadcastService } from '../../services/broadcast.service';
import { RestService } from '../../services/rest.service';
import { SwaggerTreeConverterService } from '../../services/swagger-tree-converter.service';

/**
 * property component presents information of a workflow node.
 * the presented information can be edit in this component.
 * it may load information dynamically. the content may be different for different node type.
 */
@Component({
    selector: 'b4t-node-parameters',
    styleUrls: ['./node-parameters.component.css'],
    templateUrl: 'node-parameters.component.html',
})
export class WmNodeParametersComponent implements OnInit {
    @Input() public task: RestTask;
    @Input() public planItems: PlanTreeviewItem[];

    public inputSources: ValueSource[] = [ValueSource.String, ValueSource.Topology, ValueSource.Plan];
    public outputSources: ValueSource[] = [ValueSource.Topology, ValueSource.Plan];
    public inputParams: TreeNode[] = [];
    public outputParams: TreeNode[] = [];
    public pathParams: any[] = [];
    public valueSource = ValueSource;

    private index = 1;
    private queryParams: any[] = [];

    constructor(private broadcastService: BroadcastService,
                private restService: RestService,
                private swaggerTreeConverterService: SwaggerTreeConverterService) {
    }

    public ngOnInit() {
        this.broadcastService.nodeTaskChange$.subscribe(() => {
            this.resetRequestParams();
            this.resetResponseParams();
        });
    }

    public resetRequestParams() {
        this.pathParams = [];
        this.queryParams = [];
        this.inputParams = [];

        this.task.parameters.forEach(param => {
            if (param.position === 'path') {
                this.pathParams.push(param);
            } else if (param.position === 'query') {
                this.queryParams.push(param);
            } else if (param.position === 'body') {
                const requestTreeNode = this.swaggerTreeConverterService
                    .schema2TreeNode('Request Param', this.task.restConfigId, param.schema);
                this.inputParams.push(requestTreeNode);
            } else {
                // TODO others param types not supported
            }
        });
    }

    public resetResponseParams() {
        this.outputParams = [];
        if (this.task.method && this.task.responses[0] && this.task.responses[0].schema) {
            const treeNode = this.swaggerTreeConverterService
                .schema2TreeNode('Response Params', this.task.restConfigId, this.task.responses[0].schema);
            this.outputParams.push(treeNode);
        }
    }
}
