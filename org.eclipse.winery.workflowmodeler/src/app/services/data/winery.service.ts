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
import { Observable } from 'rxjs/Observable';
import { isNullOrUndefined } from 'util';

import { PlanModel } from '../../model/plan-model';
import { NodeTemplate } from '../../model/topology/node-template';
import { HttpService } from '../../util/http.service';
import { BroadcastService } from './../broadcast.service';
import { BackendService } from './backend.service';

/**
 * WineryService
 * provides operation about winery. It can load and save data from winery.
 */
@Injectable()
export class WineryService extends BackendService {
    private repositoryURL: string;
    private namespace: string;
    private serviceTemplateId: string;
    private plan: string;

    public getBackendType() {
        return 'Winery';
    }

    public setParameters(queryParams: any) {
        this.repositoryURL = queryParams.repositoryURL;
        this.namespace = queryParams.namespace;
        this.serviceTemplateId = queryParams.id;
        this.plan = queryParams.plan;

        if (this.repositoryURL) {
            this.refreshAllNodesProperties();
            this.loadPlan().subscribe(planModel => {
                if (!planModel.nodes) {
                    planModel.nodes = [];
                }
                if (!planModel.configs) {
                    planModel.configs = {};
                }
                this.broadcastService.broadcast(this.broadcastService.planModel, planModel);
            });
        }
    }

    public loadNodeTemplates(): Observable<NodeTemplate[]> {
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

    public loadTopologyProperties(nodeTemplate: NodeTemplate): Observable<string[]> {
        const url = 'nodetypes/' + this.encode(nodeTemplate.namespace)
            + '/' + this.encode(nodeTemplate.type) + '/propertiesdefinition/winery/list/';

        return this.httpService.get(this.getFullUrl(url)).map(properties =>
            properties.map(property => property.key));
    }

    public loadNodeTemplateInterfaces(nodeTemplate: NodeTemplate): Observable<string[]> {
        const url = 'nodetypes/' + this.encode(nodeTemplate.namespace)
            + '/' + this.encode(nodeTemplate.type) + '/interfaces/';

        return this.httpService.get(this.getFullUrl(url));
    }

    public loadNodeTemplateOperations(nodeTemplate: NodeTemplate,
        interfaceName: string): Observable<string[]> {
        const url = 'nodetypes/' + this.encode(nodeTemplate.namespace)
            + '/' + this.encode(nodeTemplate.type) + '/interfaces/' + this.encode(interfaceName) + '/operations/';

        return this.httpService.get(this.getFullUrl(url));
    }

    public loadNodeTemplateOperationParameter(nodeTemplate: NodeTemplate,
        interfaceName: string,
        operation: string): Observable<any> {
        const relativePath = 'nodetypes/' + this.encode(nodeTemplate.namespace) + '/' + this.encode(nodeTemplate.type)
            + '/interfaces/' + this.encode(interfaceName) + '/operations/' + this.encode(operation) + '/';

        // input parameters
        const inputObservable = this.httpService
            .get(this.getFullUrl(relativePath + 'inputparameters'));

        // output parameters
        const outputObservable = this.httpService
            .get(this.getFullUrl(relativePath + 'outputparameters'));

        return Observable.forkJoin([inputObservable, outputObservable]).map(params => {
            return {
                input: params[0],
                output: params[1],
            };
        });
    }

    public save(planModel: PlanModel): Observable<any> {
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';

        const requestData = '-----------------------------7da24f2e50046\r\n'
            + 'Content-Disposition: form-data; name=\"file\"; filename=\"file.json\"\r\n'
            + 'Content-type: plain/text\r\n\r\n'
            + JSON.stringify(planModel) + '\r\n-----------------------------7da24f2e50046--\r\n';

        const options: any = {
            headers: {
                'Content-Type': 'multipart/form-data; boundary=---------------------------7da24f2e50046',
            },
        };

        return this.httpService.put(this.getFullUrl(url), requestData, options);
    }

    public loadPlan(): Observable<PlanModel> {
        console.log('load plan');
        const url = 'servicetemplates/' + this.encode(this.namespace)
            + '/' + this.encode(this.serviceTemplateId) + '/plans/' + this.encode(this.plan) + '/file';

        return this.httpService.get(this.getFullUrl(url));
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
