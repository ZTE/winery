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
import {isNullOrUndefined} from 'util';
import { WorkflowNode } from '../model/workflow.node';
import { BroadcastService } from './broadcast.service';
import {SwaggerTreeConverterService} from './swagger-tree-converter.service';
import {PlanModel} from '../model/plan-model';

/**
 * ModelService
 * provides all operations about plan model.
 */
@Injectable()
export class ModelService {
    private planModel: PlanModel = new PlanModel({
        nodes: [],
        configs:{}
    });

    constructor(private broadcastService: BroadcastService) {
        this.broadcastService.planModel$.subscribe(planModel =>{
            planModel.nodes = planModel.nodes.map(node => new WorkflowNode(node));
            this.planModel = planModel;
        }
        );
    }

    //constructor(private broadcastService: BroadcastService) {
    //    this.broadcastService.planModel$.subscribe(planModel => this.planModel = planModel);
    //}

    public getNodes(): WorkflowNode[] {
        return this.planModel.nodes;
    }

    public addNode(name: string, type: string, left: number, top: number) {
        this.planModel.nodes.push(new WorkflowNode({
            id: this.createId(),
            name,
            type,
            position: {
                left,
                top,
            },
        }));
    }

    public deleteNode(nodeId: string) {
        // delete related connections
        this.planModel.nodes.forEach(node => node.deleteConnection(nodeId));

        // delete current node
        const index = this.planModel.nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            this.planModel.nodes.splice(index, 1);
        }
    }

    public addConnection(sourceId: string, targetId: string) {
        const node = this.planModel.nodes.find(tmpNode => tmpNode.id === sourceId);
        if (!isNullOrUndefined(node)) {
            node.addConnection(targetId);
        }
    }

    public deleteConnection(sourceId: string, targetId: string) {
        const node = this.planModel.nodes.find(tmpNode => tmpNode.id === sourceId);
        if (!isNullOrUndefined(node)) {
            node.deleteConnection(targetId);
        }
    }

    public save() {
        console.log('****************** save data *********************');
        console.log(this.planModel);

        this.broadcastService.broadcast(this.broadcastService.saveEvent, JSON.stringify(this.planModel));
    }

    private createId() {
        const idSet = new Set();
        this.planModel.nodes.forEach(node => idSet.add(node.id));

        for (let i = 0; i < idSet.size; i++) {
            if (!idSet.has('node' + i)) {
                return 'node' + i;
            }
        }

        return 'node' + idSet.size;
    }
}
