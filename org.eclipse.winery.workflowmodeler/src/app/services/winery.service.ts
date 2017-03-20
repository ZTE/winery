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

import {Injectable} from '@angular/core';
import $ = require('jquery');
import {NodeTemplate} from "../model/nodetemplate";
import {Operation} from "../model/operation";
import {Interface} from "../model/interface";
import {BroadcastService} from "./broadcast.service";
import {isNullOrUndefined} from "util";

@Injectable()
export class WineryService {
    private repositoryURL:string;
    private namespace:string;
    private serviceTemplateId:string;
    private plan:string;

    private nodeTemplates:NodeTemplate[] = [];

    constructor(private broadcastService:BroadcastService) {
        this.broadcastService.saveEvent$.subscribe(data => this.save(data));
    }

    setRequestParam(queryParams:any) {
        this.repositoryURL = queryParams.repositoryURL;
        this.namespace = queryParams.namespace;
        this.serviceTemplateId = queryParams.id;
        this.plan = queryParams.plan;

        if (isNullOrUndefined(this.repositoryURL)) {

        } else {
            this.loadPlan();
        }

    }

    loadNodeTemplates() {
        let wineryService = this;
        let url = "servicetemplates/" + this.encode(this.namespace) + "/" + this.encode(this.serviceTemplateId) + "/topologytemplate/";

        this.request(url, function (response) {
            let nodeTemplates = [];
            for (let key in response.nodeTemplates) {
                let nodeTemplate = response.nodeTemplates[key];
                nodeTemplates.push({
                    "id": nodeTemplate.id,
                    "type": nodeTemplate.type.replace(/^\{(.+)\}(.+)/, "$2"),
                    "name": nodeTemplate.name,
                    "namespace": nodeTemplate.type.replace(/^\{(.+)\}(.+)/, "$1")
                });
            }
            wineryService.broadcastService.nodeTemplates.next(nodeTemplates);
        });
    }

    loadTopologyProperties(nodeTemplate:NodeTemplate) {
        nodeTemplate = this.nodeTemplates.find(nodeTemplate => nodeTemplate.name == "VNFC.AAA");
        let url = "nodetypes/" + this.encode(nodeTemplate.namespace) + "/" + this.encode(nodeTemplate.id) + "/propertiesdefinition/winery/list/";

        this.request(url, function (properties) {
            properties.forEach(property => nodeTemplate.properties.push(property.key));
        });
    }

    loadNodeTemplateInterfaces(namespace:string, nodeType:string) {
        let url = "nodetypes/" + this.encode(namespace) + "/" + this.encode(nodeType) + "/interfaces/";
        let wineryService = this;
        this.request(url, function (interfaces) {
            wineryService.broadcastService.broadcast(wineryService.broadcastService.nodeInterfaces, interfaces);
        })
    }

    loadNodeTemplateOperations(namespace:string, nodeType:string, interfaceName:string) {
        let wineryService = this;
        let url = "nodetypes/" + this.encode(namespace) + "/" + this.encode(nodeType) + "/interfaces/" + this.encode(interfaceName) + "/operations/";

        this.request(url, function (operations) {
            let res = [];
            operations.forEach(operation => res.push(new Operation(operation)));
            wineryService.broadcastService.broadcast(wineryService.broadcastService.nodeOperations, res);
        });
    }

    loadNodeTemplateOperationParameter(namespace:string, nodeType:string, interfaceName:string, operation:string) {
        let wineryService = this;
        let params = {
            input: [],
            output: []
        };

        // inputparameters
        let relativePath = "nodetypes/" + this.encode(namespace) + "/" + this.encode(nodeType) + "/interfaces/" + this.encode(interfaceName) + "/operations/" + this.encode(operation) + "/";
        this.request(relativePath + "inputparameters", function (response) {
            params.input = response;
            wineryService.broadcastService.broadcast(wineryService.broadcastService.nodeParameters, params);
        })

        // outputparameters
        this.request(relativePath + "outputparameters", function (response) {
            params.output = response;
            wineryService.broadcastService.broadcast(wineryService.broadcastService.nodeParameters, params);
        })
    }

    decode(param:string):string {
        return decodeURIComponent(decodeURIComponent(param));
    }

    encode(param:string):string {
        return encodeURIComponent(encodeURIComponent(param));
    }

    request(url:string, callback:any) {
        $.ajax({
            crossDomain: true,
            dataType: "json",
            url: this.repositoryURL + url,
            success: callback,
            error: function (err) {
                console.log("request error");
                console.log(err);
            }
        })
    }

    save(data:any) {
        let url = "servicetemplates/" + this.encode(this.namespace) + "/" + this.encode(this.serviceTemplateId) + "/plans/" + this.encode(this.plan) + "/file";
        $.ajax({
            crossDomain: true,
            contentType: "multipart/form-data; boundary=---------------------------7da24f2e50046",
            data: '-----------------------------7da24f2e50046\r\nContent-Disposition: form-data; name="file"; filename="file.json"\r\nContent-type: plain/text\r\n\r\n' + data + '\r\n-----------------------------7da24f2e50046--\r\n',
            url: this.repositoryURL + url,
            type: "PUT",
            success: function () {
                console.log("save success");
            }
        });
    }

    loadPlan() {
        let wineryService = this;
        let url = "servicetemplates/" + this.encode(this.namespace) + "/" + this.encode(this.serviceTemplateId) + "/plans/" + this.encode(this.plan) + "/file";
        this.request(url, function (response) {
            let nodes = JSON.stringify(response) == "{}" ? [] : response;
            console.log("load plan success");
            console.log(nodes);
            wineryService.broadcastService.broadcast(wineryService.broadcastService.planModel, nodes);
        });
    }

}