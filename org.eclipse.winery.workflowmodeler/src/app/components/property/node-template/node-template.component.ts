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

import { NodeTemplate } from '../../../model/node-template';
import { Operation } from '../../../model/operation';
import { ToscaNodeTask } from '../../../model/workflow/tosca-node-task';
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
    @Input() public node: ToscaNodeTask;
    private nodeInterfaces: any[] = [];
    private nodeOperations: any[] = [];
    private nodeTemplates: NodeTemplate[] = [];

    constructor(private wineryService: WineryService) {
    }

    public ngAfterViewInit() {
        this.wineryService.loadNodeTemplates()
            .subscribe(nodeTemplates => this.nodeTemplates = nodeTemplates);

        this.loadInterfaces();
        this.loadOperations();
    }

    public nodeTemplateChanged() {
        this.setTemplateNamespace();

        this.node.template.nodeInterface = '';
        this.nodeInterfaceChanged();

        this.loadInterfaces();
    }

    public nodeInterfaceChanged() {

        this.node.template.operation = '';
        this.nodeOperationChanged();

        this.loadOperations();
    }

    public nodeOperationChanged() {
        this.node.input = [];
        this.node.output = [];

        this.loadParameters();
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
        if (this.node.template.nodeInterface) {
            this.nodeOperations = [];
            this.wineryService.loadNodeTemplateOperations(
                this.node.template.namespace,
                this.node.template.type,
                this.node.template.nodeInterface)
                .subscribe(operations =>
                    operations.forEach(operation => this.nodeOperations.push(new Operation(operation))));
        }
    }

    private loadParameters() {
        if (this.node.template.operation) {
            this.wineryService
                .loadNodeTemplateOperationParameter(
                    this.node.template.namespace,
                    this.node.template.type,
                    this.node.template.nodeInterface,
                    this.node.template.operation)
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
                });
        }
    }
}
