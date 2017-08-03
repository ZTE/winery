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
import { ActivatedRoute } from '@angular/router';
import { Observable } from '../../../../node_modules/rxjs/Rx.d';

import { PlanModel } from '../../model/plan-model';
import {NodeTemplate} from '../../model/topology/node-template';
import {BroadcastService} from '../broadcast.service';
import {HttpService} from '../../util/http.service';
import {NotifyService} from '../notify.service';

/**
 * BackendService
 * provides backend data accessor to load and save data.
 */
@Injectable()
export abstract class BackendService {

    constructor(protected broadcastService: BroadcastService,
                private notifyService: NotifyService,
                protected httpService: HttpService) {
        this.broadcastService.saveEvent$.subscribe(planModel => {
            this.save(planModel).subscribe(response => this.notifyService.success('save plan success'));
        });
    }

    public abstract setParameters(params: any);

    public abstract loadNodeTemplates(): Observable<NodeTemplate[]>;

    public abstract loadTopologyProperties(nodeTemplate: NodeTemplate): Observable<string[]>;

    public abstract loadNodeTemplateInterfaces(nodeTemplate: NodeTemplate): Observable<string[]>;

    public abstract loadNodeTemplateOperations(nodeTemplate: NodeTemplate,
                                                interfaceName: string): Observable<string[]>;

    public abstract loadNodeTemplateOperationParameter(nodeTemplate: NodeTemplate,
                                                        interfaceName: string,
                                                        operation: string): Observable<any>;

    public abstract save(planModel: PlanModel): Observable<any>;

    public abstract loadPlan(): Observable<PlanModel>;
}
