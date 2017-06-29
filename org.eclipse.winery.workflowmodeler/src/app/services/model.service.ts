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
import { PlanModel } from '../model/plan-model';
import { WorkflowNode } from '../model/workflow.node';
import { BroadcastService } from './broadcast.service';
import { SwaggerTreeConverterService } from './swagger-tree-converter.service';

/**
 * ModelService
 * provides all operations about plan model.
 */
@Injectable()
export class ModelService {
    private planModel: PlanModel = new PlanModel({
        configs: {},
        nodes: [],
    });

    constructor(private broadcastService: BroadcastService) {
        this.broadcastService.planModel$.subscribe(plan => this.planModel = plan);
    }

    public getNodes(): WorkflowNode[] {
        return this.planModel.nodes;
    }

    public addNode(name: string, type: string, left: number, top: number) {
        const node = new WorkflowNode({
            id: this.createId(),
            name,
            type,
            position: {
                left,
                top,
                width: 200,
                height: 100,
            },
        });

        this.planModel.nodes.push(node);
    }

    public changeParent(id: string, originalParentId: string, targetParentId: string) {
        if (originalParentId === targetParentId) {
            return;
        }

        const nodeMap = this.getNodeMap();

        const node: WorkflowNode = this.deleteNode(originalParentId, id);

        if (targetParentId) {
            nodeMap.get(targetParentId).addChild(node);
        } else {
            this.planModel.addNode(node);
        }
    }

    public updatePosition(id: string, left: number, top: number, width: number, height: number) {
        const node = this.getNodeMap().get(id);

        node.position.left = left;
        node.position.top = top;
        node.position.width = width;
        node.position.height = height;
    }

    public getNodeMap(): Map<string, WorkflowNode> {
        const map = new Map<string, WorkflowNode>();
        this.toNodeMap(this.planModel.nodes, map);
        return map;
    }

    public getAncestors(id: string): WorkflowNode[] {
        const nodeMap = this.getNodeMap();
        const ancestors = [];

        let ancestor = nodeMap.get(id);
        do {
            ancestor = this.getParentNode(ancestor.id, nodeMap);
            if (ancestor && ancestor.id !== id) {
                ancestors.push(ancestor);
            }
        } while (ancestor);

        return ancestors;
    }

    private getParentNode(id: string, nodeMap: Map<string, WorkflowNode>): WorkflowNode {
        let parentNode;
        nodeMap.forEach((node, key) => {
            const childNode = node.children.find(child => child.id === id);
            if (childNode) {
                parentNode = node;
            }
        });

        return parentNode;
    }

    public isDescendantNode(node: WorkflowNode, descendantId: string): boolean {
        const tmp = node.children.find(child => {
            return child.id === descendantId || this.isDescendantNode(child, descendantId);
        });

        return tmp !== undefined;
    }

    private toNodeMap(nodes: WorkflowNode[], map: Map<string, WorkflowNode>) {
        nodes.forEach(node => {
            this.toNodeMap(node.children, map);
            map.set(node.id, node);
        });
    }

    public addConnection(parentId: string, sourceId: string, targetId: string) {
        const nodeMap = this.getNodeMap();
        const nodes = parentId ? nodeMap.get(parentId).children : this.planModel.nodes;

        const node = nodes.find(tmpNode => tmpNode.id === sourceId);
        if (!isNullOrUndefined(node)) {
            node.addConnection(targetId);
        }
    }

    public deleteConnection(parentId: string, sourceId: string, targetId: string) {
        const nodeMap = this.getNodeMap();
        const nodes = parentId ? nodeMap.get(parentId).children : this.planModel.nodes;

        const node = nodes.find(tmpNode => tmpNode.id === sourceId);
        if (!isNullOrUndefined(node)) {
            node.deleteConnection(targetId);
        }
    }

    public deleteNode(parentId: string, nodeId: string): WorkflowNode {
        const nodeMap = this.getNodeMap();

        const nodes = parentId ? nodeMap.get(parentId).children : this.planModel.nodes;

        // delete related connections
        nodes.forEach(node => node.deleteConnection(nodeId));

        // delete current node
        const index = nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            const node = nodes.splice(index, 1)[0];
            node.connection = [];
            return node;
        }

        return null;
    }

    public save() {
        console.log('****************** save data *********************');
        console.log(this.planModel);

        this.broadcastService.broadcast(this.broadcastService.saveEvent, JSON.stringify(this.planModel));
    }

    private createId() {
        const nodeMap = this.getNodeMap();

        for (let i = 0; i < nodeMap.size; i++) {
            const key = 'node' + i;
            if (!nodeMap.get(key)) {
                return key;
            }
        }

        return 'node' + nodeMap.size;
    }
}
