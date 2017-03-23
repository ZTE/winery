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

import {Injectable} from "@angular/core";
import {isNullOrUndefined} from "util";
import {NodeTemplate} from "../model/nodetemplate";
import {Operation} from "../model/operation";
import {BroadcastService} from "./broadcast.service";
import $ = require("jquery");

@Injectable()
export class WineryService {
    private repositoryURL: string;
    private namespace: string;
    private serviceTemplateId: string;
    private plan: string;

    constructor(private broadcastService: BroadcastService) {
        this.broadcastService.saveEvent$.subscribe(data => this.save(data));
    }

    public setRequestParam(queryParams: any) {
        this.repositoryURL = queryParams.repositoryURL;
        this.namespace = queryParams.namespace;
        this.serviceTemplateId = queryParams.id;
        this.plan = queryParams.plan;

        if (!isNullOrUndefined(this.repositoryURL)) {
			this.loadPlan();
        }

    }

    public loadNodeTemplates() {
        let wineryService = this;
        let url = "servicetemplates/" + this.encode(this.namespace)
			+ "/" + this.encode(this.serviceTemplateId) + "/topologytemplate/";

        this.request(url, response => {
            let nodeTemplates = [];
            for (let key in response.nodeTemplates) {
				if (response.nodeTemplates.hasOwnProperty(key)) {
					let nodeTemplate = response.nodeTemplates[key];
					nodeTemplates.push({
						id: nodeTemplate.id,
						type: nodeTemplate.type.replace(/^\{(.+)\}(.+)/, "$2"),
						name: nodeTemplate.name,
						namespace: nodeTemplate.type.replace(/^\{(.+)\}(.+)/, "$1"),
					});
				}
            }
            wineryService.broadcastService.nodeTemplates.next(nodeTemplates);
        });
    }

    public loadTopologyProperties(nodeTemplate: NodeTemplate) {
        let url = "nodetypes/" + this.encode(nodeTemplate.namespace)
			+ "/" + this.encode(nodeTemplate.id) + "/propertiesdefinition/winery/list/";

        this.request(url, properties => {
            properties.forEach(property => nodeTemplate.properties.push(property.key));
        });
    }

    public loadNodeTemplateInterfaces(namespace: string, nodeType: string) {
        let url = "nodetypes/" + this.encode(namespace)
			+ "/" + this.encode(nodeType) + "/interfaces/";
        let wineryService = this;
        this.request(url, interfaces => {
            wineryService.broadcastService.broadcast(wineryService.broadcastService.nodeInterfaces, interfaces);
        });
    }

    public loadNodeTemplateOperations(namespace: string, nodeType: string, interfaceName: string) {
        let wineryService = this;
        let url = "nodetypes/" + this.encode(namespace)
			+ "/" + this.encode(nodeType) + "/interfaces/" + this.encode(interfaceName) + "/operations/";

        this.request(url, operations => {
            let res = [];
            operations.forEach(operation => res.push(new Operation(operation)));
            wineryService.broadcastService.broadcast(wineryService.broadcastService.nodeOperations, res);
        });
    }

    public loadNodeTemplateOperationParameter(
		namespace: string, nodeType: string, interfaceName: string, operation: string) {
        let wineryService = this;
        let params = {
            input: [],
            output: [],
        };

        // inputparameters
        let relativePath = "nodetypes/" + this.encode(namespace) + "/" + this.encode(nodeType)
			+ "/interfaces/" + this.encode(interfaceName) + "/operations/" + this.encode(operation) + "/";
        this.request(relativePath + "inputparameters", response => {
            params.input = response;
            wineryService.broadcastService.broadcast(wineryService.broadcastService.nodeParameters, params);
        });

        // outputparameters
        this.request(relativePath + "outputparameters", response => {
            params.output = response;
            wineryService.broadcastService.broadcast(wineryService.broadcastService.nodeParameters, params);
        });
    }

    public save(data: string) {
		console.log("process data:");
		console.log(data);
        let url = "servicetemplates/" + this.encode(this.namespace)
			+ "/" + this.encode(this.serviceTemplateId) + "/plans/" + this.encode(this.plan) + "/file";

		let requestData = "-----------------------------7da24f2e50046\r\n"
			+ "Content-Disposition: form-data; name=\"file\"; filename=\"file.json\"\r\n"
			+ "Content-type: plain/text\r\n\r\n"
			+ data + "\r\n-----------------------------7da24f2e50046--\r\n";

        $.ajax({
            crossDomain: true,
            contentType: "multipart/form-data; boundary=---------------------------7da24f2e50046",
            data: requestData,
            url: this.repositoryURL + url,
            type: "PUT",
            success() {
                console.log("save success");
            },
        });
    }

	public loadPlan() {
        let wineryService = this;
        let url = "servicetemplates/" + this.encode(this.namespace)
			+ "/" + this.encode(this.serviceTemplateId) + "/plans/" + this.encode(this.plan) + "/file";
        this.request(url, response => {
            let nodes = JSON.stringify(response) === "{}" ? [] : response;
            console.log("load plan success");
            console.log(nodes);
            wineryService.broadcastService.broadcast(wineryService.broadcastService.planModel, nodes);
        });
    }

	private decode(param: string): string {
		return decodeURIComponent(decodeURIComponent(param));
	}

	private encode(param: string): string {
		return encodeURIComponent(encodeURIComponent(param));
	}

	private request(url: string, callback: any) {
		$.ajax({
			crossDomain: true,
			dataType: "json",
			url: this.repositoryURL + url,
			success: callback,
			error(err) {
				console.log("request error");
				console.log(err);
			},
		});
	}

}
