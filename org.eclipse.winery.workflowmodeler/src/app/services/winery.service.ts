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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';
import { NodeTemplate } from '../model/nodetemplate';
import { Operation } from '../model/operation';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';
import { NotifyService } from './notify.service';
import { PlanModel } from '../model/plan-model';
import { WorkflowNode } from '../model/workflow.node';

/**
 * WineryService
 * provides operation about winery. It can load and save data from winery.
 */
@Injectable()
export class WineryService {
    private repositoryURL: string;
    private namespace: string;
    private serviceTemplateId: string;
    private plan: string;

    private planModel: PlanModel;

    constructor(
        private broadcastService: BroadcastService,
        private httpService: HttpService,
        private notifyService: NotifyService) {
        this.broadcastService.saveEvent$.subscribe(data => this.save());
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

    public loadNodeTemplates(): Observable<any> {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/topologytemplate/';

        return this.httpService.get(this.getFullUrl(url)).map(response => {
            const nodeTemplates = [];
            for (const key in response.nodeTemplates) {
                if (response.nodeTemplates.hasOwnProperty(key)) {
                    const nodeTemplate = response.nodeTemplates[key];
                    nodeTemplates.push({
                        id: nodeTemplate.id,
                        type: nodeTemplate.type.replace(/^\{(.+)\}(.+)/, '$2'),
                        name: nodeTemplate.name,
                        namespace: nodeTemplate.type.replace(/^\{(.+)\}(.+)/, '$1'),
                    });
                }
            }
            return nodeTemplates;
        });
    }

    public loadTopologyProperties(nodeTemplate: NodeTemplate) {
        const url = 'nodetypes/' + this.encode(nodeTemplate.namespace)
            + '/' + this.encode(nodeTemplate.id) + '/propertiesdefinition/winery/list/';

        this.httpService.get(this.getFullUrl(url)).subscribe(properties => {
            properties.forEach(property => nodeTemplate.properties.push(property.key));
        });
    }

    public loadNodeTemplateInterfaces(namespace: string, nodeType: string): Observable<any> {
        const url = 'nodetypes/' + this.encode(namespace)
            + '/' + this.encode(nodeType) + '/interfaces/';

        return this.httpService.get(this.getFullUrl(url));
    }

    public loadNodeTemplateOperations(namespace: string,
                                      nodeType: string,
                                      interfaceName: string): Observable<any> {
        const url = 'nodetypes/' + this.encode(namespace)
            + '/' + this.encode(nodeType) + '/interfaces/' + this.encode(interfaceName) + '/operations/';

        return this.httpService.get(this.getFullUrl(url));
    }

    public loadNodeTemplateOperationParameter(namespace: string,
                                              nodeType: string,
                                              interfaceName: string,
                                              operation: string): Promise<any> {
        const relativePath = 'nodetypes/' + this.encode(namespace) + '/' + this.encode(nodeType)
            + '/interfaces/' + this.encode(interfaceName) + '/operations/' + this.encode(operation) + '/';

        // input parameters
        let inputPromise: Promise<any> = this.httpService
            .get(this.getFullUrl(relativePath + 'inputparameters')).toPromise();

        // output parameters
        let outputPromise: Promise<any> = this.httpService
            .get(this.getFullUrl(relativePath + 'outputparameters')).toPromise();

        return Promise.all([inputPromise, outputPromise]).then(params => {
            return {"input": params[0], "output": params[1]}
        });
    }

    public save() {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';

        const requestData = '-----------------------------7da24f2e50046\r\n'
            + 'Content-Disposition: form-data; name=\"file\"; filename=\"file.json\"\r\n'
            + 'Content-type: plain/text\r\n\r\n'
            + JSON.stringify(this.planModel) + '\r\n-----------------------------7da24f2e50046--\r\n';

        const options: any = {
            headers: {
                'Content-Type': 'multipart/form-data; boundary=---------------------------7da24f2e50046',
            },
        };

        this.httpService.put(this.getFullUrl(url), requestData, options)
            .subscribe(response => this.notifyService.success('save plan success'));
    }

    public loadPlan() {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';
        //this.httpService.get(this.getFullUrl(url)).subscribe( response => {
        //    const nodes = JSON.stringify(response) === '{}' ? [] : response;
        //    console.log('load plan success');
        //    console.log(nodes);
        //    this.broadcastService.broadcast(this.broadcastService.planModel, nodes);
        //});

        this.httpService.get(this.getFullUrl(url)).subscribe( response => {
            //const nodes = JSON.stringify(response) === '{}' ? [] : response;
            console.log('load plan success');
            console.log(response);
            if(!response.nodes) {
                response.nodes = [];
            }
            if(!response.configs) {
                response.configs = {};
            }
            response.nodes = response.nodes.map(node => new WorkflowNode(node));
            this.planModel = new PlanModel(response);
            this.broadcastService.broadcast(this.broadcastService.planModel, this.planModel);
        });
    }

    private decode(param: string): string {
        return decodeURIComponent(decodeURIComponent(param));
    }

    private encode(param: string): string {
        return encodeURIComponent(encodeURIComponent(param));
    }

    private getFullUrl(relativePath: string) {
        return this.repositoryURL + relativePath;
    }
}
