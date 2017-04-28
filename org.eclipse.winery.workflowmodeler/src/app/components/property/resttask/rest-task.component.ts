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
import { AfterViewInit, Component, Input } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { WorkflowNode } from "../../../model/workflow.node";
import { BroadcastService } from "../../../services/broadcast.service";
import { WineryService } from "../../../services/winery.service";
import {RestService} from "../../../services/rest.service";
import {SwaggerData} from "../../../model/swagger.data";
import {Swagger} from "../../../model/swagger";
import {SwaggerPath} from "../../../model/swagger";
import {SwaggerMethod} from "../../../model/swagger";
import {SwaggerParameter} from "../../../model/swagger";
import {SwaggerResponse} from "../../../model/swagger";

@Component({
	selector: "b4t-rest-task",
	templateUrl: "rest-task.component.html",
})
export class WmRestTaskComponent implements AfterViewInit {
	@Input()
	private node: WorkflowNode;

	private swaggerJson: any = {};
	private restInterfaces: any[];
	private restOperations: any = [];
	private swagger: Swagger;

	constructor(private restService: RestService) {

	}

	public ngAfterViewInit() {
        setTimeout(() => this.loadInterfaces(), 0);
	}

	private serviceChanged() {
		this.node.nodeTemplate = this.node.template.id;

		this.node.template.interface = "";
		this.interfaceChanged();

		this.loadInterfaces();
	}

	private interfaceChanged() {
		this.node.nodeInterface = this.node.template.interface;
		this.node.template.operation = "";
		this.operationChanged();

		this.loadOperations();
	}

	private operationChanged() {
		this.node.nodeOperation = this.node.template.operation;
		this.node.input = [];
		this.node.output = [];

		this.loadParameters();
	}

	private loadInterfaces() {
		if (this.node.nodeTemplate) {
			this.swagger = this.restService.getSwaggerInfo(this.node.nodeTemplate);

            if(this.swagger) {
                this.restInterfaces = Object.keys(this.swagger.paths.paths);
                this.loadOperations();
            } else {
                console.error("swagger info not specified");
            }
		}
	}

	private loadOperations() {
		if(this.node.nodeInterface) {
			let swaggerPath: SwaggerPath = this.swagger.paths.paths[this.node.nodeInterface];
			this.restOperations = Object.keys(swaggerPath.methodObj);
		}
	}

	private loadParameters() {
		if(this.node.nodeOperation) {
			let path:SwaggerPath = this.swagger.paths.paths[this.node.nodeInterface];
			let method: SwaggerMethod = path.methodObj[this.node.nodeOperation];

			this.node.input = [];
			method.parameters.forEach(param => this.node.input.push({
				name: param.name,
				type: param.type,
				value: "",
				position: param.position,
			}));

			let responseParams = this.restService.getResponseParameters(
				this.swagger, this.node.nodeInterface, this.node.nodeOperation);
			this.node.output = responseParams;
		}
	}
}
