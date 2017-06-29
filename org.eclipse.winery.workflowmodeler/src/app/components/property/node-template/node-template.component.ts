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
import { AfterViewInit, Component, Input  } from '@angular/core';
import { Subscription } from '../../../../../node_modules/rxjs/Subscription.d';
import {Operation} from '../../../model/operation';
import { WorkflowNode } from '../../../model/workflow.node';
import { BroadcastService } from '../../../services/broadcast.service';
import { WineryService } from '../../../services/winery.service';

/**
 * node template component provides operations about tosca modules which saved in winery.
 * This component will be used in the property component while the corresponding workflow node is calling the node template's operation
 */
@Component({
    selector: 'b4t-node-template',
    templateUrl: 'node-template.component.html',
})
export class WmNodeTemplateComponent implements AfterViewInit {
    @Input()
    public node: WorkflowNode;
    private nodeTemplates: any[] = [];
    private nodeInterfaces: any[] = [];
    private nodeOperations: any[] = [];

    constructor(private broadcastService: BroadcastService,
                private wineryService: WineryService) {
    }

    public ngAfterViewInit() {
        this.wineryService.loadNodeTemplates()
            .subscribe(nodeTemplates => this.nodeTemplates = nodeTemplates);

        this.loadInterfaces();
        this.loadOperations();
    }

    public nodeTemplateChanged() {
        this.node.nodeTemplate = this.node.template.id;
        this.setTemplateNamespace();

        this.node.template.interface = '';
        this.nodeInterfaceChanged();

        this.loadInterfaces();
    }

    public nodeInterfaceChanged() {
        this.node.nodeInterface = this.node.template.interface;
        this.node.template.operation = '';
        this.nodeOperationChanged();

        this.loadOperations();
    }

    public nodeOperationChanged() {
        this.node.nodeOperation = this.node.template.operation;
        this.node.input = [];
        this.node.output = [];

        this.notifyTaskChanged();

        this.loadParameters();
    }

    private notifyTaskChanged() {
        this.broadcastService.broadcast(this.broadcastService.nodeTaskChange, null);
    }

    private setTemplateNamespace() {
        const nodeTemplate = this.nodeTemplates.find(
            tmpNodeTemplate => tmpNodeTemplate.id === this.node.template.id);

        if (nodeTemplate) {
            this.node.template.namespace = nodeTemplate.namespace;
            this.node.template.type = nodeTemplate.type;
        }
    }

    private loadInterfaces() {
        if (this.node.template.id) {
            this.wineryService
                .loadNodeTemplateInterfaces(this.node.template.namespace, this.node.template.type)
                .subscribe(interfaces => this.nodeInterfaces = interfaces);
        }
    }

    private loadOperations() {
        if (this.node.template.interface) {
            this.nodeOperations = [];
            this.wineryService.loadNodeTemplateOperations(
                this.node.template.namespace,
                this.node.template.type,
                this.node.template.interface)
                .subscribe(operations =>
                    operations.forEach(operation => this.nodeOperations.push(new Operation(operation))));
        }
    }

    private loadParameters() {
        if (this.node.template.operation) {
            const template = this.node.template;
            this.wineryService
                .loadNodeTemplateOperationParameter(
                    template.namespace,
                    template.type,
                    template.interface,
                    template.operation)
                .then(params => {
                    this.node.input = [];
                    this.node.output = [];

                    params.input.forEach(param => this.node.input.push({
                        name: param,
                        type: 'string',
                        value: '',
                    }));

                    params.output.forEach(param => this.node.output.push({
                        name: param,
                        type: 'string',
                        value: '',
                    }));
                    this.notifyTaskChanged();
                });
        }
    }
}
