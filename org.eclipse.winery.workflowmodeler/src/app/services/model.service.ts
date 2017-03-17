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

import $ = require('jquery');
import {BroadcastService} from "./broadcast.service";
import {Injectable} from '@angular/core';

import { WorkflowNode } from '../model/workflow.node';
import {isNullOrUndefined} from "util";
import {JsPlumbService} from "./jsplumb.service";

@Injectable()
export class ModelService {
    private nodes:WorkflowNode[] = [];

    constructor(private broadcastService:BroadcastService) {
        this.broadcastService.planModel$.subscribe(nodes => {
            nodes.forEach(node => this.nodes.push(new WorkflowNode(node)));
        });

    }

    createId() {
        let idSet = new Set();
        this.nodes.forEach(node => idSet.add(node.id));

        for (let i = 0; i < idSet.size; i++) {
            if (!idSet.has("node" + i)) {
                return "node" + i;
            }
        }

        return "node" + idSet.size;
    }


    getNodes():WorkflowNode[] {
        return this.nodes;
    }

    addNode(name:string,
            type:string,
            left:number,
            top:number) {
        this.nodes.push(new WorkflowNode({
            "id": this.createId(),
            "name": name,
            "type": type,
            "position": {
                "left": left, "top": top
            },
            "template": {},
            "input": [],
            "output": []
        }));
    }

    deleteNode(nodeId:string) {
        // delete related connections
        this.nodes.forEach(node => node.deleteConnection(nodeId));

        // delete current node
        let index = this.nodes.findIndex(node => node.id == nodeId);
        if (index != -1) {
            this.nodes.splice(index, 1);
        }
    }

    addConnection(sourceId:string, targetId:string) {
        let node = this.nodes.find(node => node.id == sourceId);
        if (isNullOrUndefined(node)) {

        } else {
            node.addConnection(targetId);
        }
    }

    deleteConnection(sourceId:string, targetId:string) {
        let node = this.nodes.find(node => node.id == sourceId);
        if (isNullOrUndefined(node)) {

        } else {
            node.deleteConnection(targetId);
        }
    }

    save() {
        console.log("****************** save data *********************");
        console.log(this.nodes);
        this.broadcastService.broadcast(this.broadcastService.saveEvent, JSON.stringify(this.nodes));
    }


}