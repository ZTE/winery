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
import { isNullOrUndefined } from 'util';
import { Observable } from 'rxjs/Observable';
import { NodeTemplate } from '../../model/topology/node-template';
import { PlanModel } from '../../model/plan-model';
import { HttpService } from '../../util/http.service';
import { BroadcastService } from './../broadcast.service';
import { BackendService } from './backend.service';
import '../../util/rxjs-operators';

/**
 * WineryService
 * provides operation about winery. It can load and save data from winery.
 */
@Injectable()
export class CatalogService extends BackendService {
    private rootUrl: string = '/openoapi/catalog/v1';
    private serviceTemplateId: string;
    private planName: string;

    public setParameters(queryParams: any) {
        this.serviceTemplateId = queryParams.serviceTemplateId;
        this.planName = queryParams.plan;
        console.log(`planName`, this.planName);
        if (this.planName) {
            console.log('load plan');
            this.refreshAllNodesProperties();
            this.loadPlan().subscribe(planModel => {
                console.log('load plan success');
                if (planModel instanceof Array) {
                    planModel = new PlanModel();
                }
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
        const url = `/csars/${this.serviceTemplateId}/tosca/nodes`;

        return this.httpService.get(this.getFullUrl(url));
    }

    public loadTopologyProperties(nodeTemplate: NodeTemplate): Observable<string[]> {
        const url = `/csars/${this.serviceTemplateId}/tosca/nodes/${nodeTemplate.name}/properties`;

        return this.httpService.get(this.getFullUrl(url)).map(properties => {
            return Object.keys(properties);
        });

    }

    public loadNodeTemplateInterfaces(nodeTemplate: NodeTemplate): Observable<any> {
        const url = ``;

        return this.httpService.get(this.getFullUrl(url));
    }

    public loadNodeTemplateOperations(nodeTemplate: NodeTemplate,
        interfaceName: string): Observable<any> {
        const url = ``;

        return this.httpService.get(this.getFullUrl(url));
    }

    public loadNodeTemplateOperationParameter(nodeTemplate: NodeTemplate,
        interfaceName: string,
        operation: string): Observable<any> {
        const relativePath = ``;

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
        const url = `/md/servicetemplates/${this.serviceTemplateId}/plans/${this.planName}`;

        return this.httpService.post(this.getFullUrl(url), JSON.stringify(planModel));
    }

    public loadPlan(): Observable<PlanModel> {
        const url = `/md/servicetemplates/${this.serviceTemplateId}/plans/${this.planName}`;

        return this.httpService.get(this.getFullUrl(url)).map(response => {
            return response;
        });
    }

    private getFullUrl(relativePath: string) {
        return this.rootUrl + relativePath;
    }
}
