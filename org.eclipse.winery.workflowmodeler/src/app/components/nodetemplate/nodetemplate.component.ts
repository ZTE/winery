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
import { AfterViewInit, Component, Input, OnDestroy  } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { WorkflowNode } from "../../model/workflow.node";
import { BroadcastService } from "../../services/broadcast.service";
import { WineryService } from "../../services/winery.service";

@Component({
    selector: "wm-node-template",
    styleUrls: ["./nodetemplate.component.css"],
    templateUrl: "nodetemplate.component.html",
})
export class WmNodeTemplateComponent implements AfterViewInit, OnDestroy {
    @Input()
    private node: WorkflowNode;
	private nodeTemplates: any[] = [];
	private nodeInterfaces: any[] = [];
	private nodeOperations: any[] = [];

	private nodeTemplateSubscription: Subscription;
	private nodeInterfaceSubscription: Subscription;
	private nodeOperationSubscription: Subscription;
	private nodeParameterSubscription: Subscription;

    constructor(private wineryService: WineryService,
                private broadcastService: BroadcastService) {
        this.nodeTemplateSubscription = this.broadcastService.nodeTemplates$.subscribe(
			nodeTemplates => this.nodeTemplates = nodeTemplates);
        this.nodeInterfaceSubscription = this.broadcastService.nodeInterfaces$.subscribe(
			interfaces => this.nodeInterfaces = interfaces);
        this.nodeOperationSubscription = this.broadcastService.nodeOperations$.subscribe(
			operations => this.nodeOperations = operations);
    }

    public ngAfterViewInit() {
        this.wineryService.loadNodeTemplates();
        this.loadInterfaces();
        this.loadOperations();

        let template = this;
        this.nodeParameterSubscription = this.broadcastService.nodeParameters$.subscribe(params => {
            template.node.input = [];
            template.node.output = [];

            params.input.forEach(param => template.node.input.push({
                name: param,
                type: "string",
                value: "",
            }));

            params.output.forEach(param => template.node.output.push({
                name: param,
                type: "string",
                value: "",
            }));
        });
    }

	public ngOnDestroy() {
        // prevent memory leak when component destroyed
        this.nodeTemplateSubscription.unsubscribe();
        this.nodeInterfaceSubscription.unsubscribe();
        this.nodeOperationSubscription.unsubscribe();
        this.nodeParameterSubscription.unsubscribe();
    }

    private nodeTemplateChanged() {
        this.node.nodeTemplate = this.node.template.id;
        this.setTemplateNamespace();

        this.node.template.interface = "";
        this.nodeInterfaceChanged();

        this.loadInterfaces();
    }

    private nodeInterfaceChanged() {
        this.node.nodeInterface = this.node.template.interface;
        this.node.template.operation = "";
        this.nodeOperationChanged();

        this.loadOperations();
    }

    private nodeOperationChanged() {
        this.node.nodeOperation = this.node.template.operation;
        this.node.input = [];
        this.node.output = [];

        this.loadParameters();
    }

    private setTemplateNamespace() {
        let nodeTemplate = this.nodeTemplates.find(
			tmpNodeTemplate => tmpNodeTemplate.id === this.node.template.id);

        if (nodeTemplate) {
            this.node.template.namespace = nodeTemplate.namespace;
            this.node.template.type = nodeTemplate.type;
        }
    }

    private loadInterfaces() {
        if (this.node.template.id) {
            this.wineryService.loadNodeTemplateInterfaces(this.node.template.namespace, this.node.template.type);
        }
    }

    private loadOperations() {
        if (this.node.template.interface) {
            this.wineryService.loadNodeTemplateOperations(
				this.node.template.namespace, this.node.template.type, this.node.template.interface);
        }
    }

    private loadParameters() {
        if (this.node.template.operation) {
            let template = this.node.template;
            this.wineryService.loadNodeTemplateOperationParameter(
				template.namespace, template.type, template.interface, template.operation);
        }
    }
}
