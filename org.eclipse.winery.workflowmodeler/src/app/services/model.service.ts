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
import { IntermediateCatchEvent } from '../model/workflow/intermediate-catch-event';
import { Position } from '../model/workflow/position';
import { RestTask } from '../model/workflow/rest-task';
import { SequenceFlow } from '../model/workflow/sequence-flow';
import { StartEvent } from '../model/workflow/start-event';
import { SubProcess } from '../model/workflow/sub-process';
import { ToscaNodeTask } from '../model/workflow/tosca-node-task';
import { WorkflowNode } from '../model/workflow/workflow-node';
import { BroadcastService } from './broadcast.service';
import { SwaggerTreeConverterService } from './swagger-tree-converter.service';

/**
 * ModelService
 * provides all operations about plan model.
 */
@Injectable()
export class ModelService {
    public rootNodeId = 'root';

    private planModel: PlanModel = new PlanModel();

    constructor(private broadcastService: BroadcastService) {
        this.broadcastService.planModel$.subscribe(plan => this.planModel = plan);
    }

    public getChildrenNodes(parentId: string): WorkflowNode[] {
        if (!parentId || parentId === this.rootNodeId) {
            return this.planModel.nodes;
        } else {
            const node = this.getNodeMap().get(parentId);
            if (node.type === 'subProcess') {
                return (<SubProcess>node).children;
            } else {
                return [];
            }
        }
    }

    public getNodes(): WorkflowNode[] {
        return this.planModel.nodes;
    }

    public getSequenceFlow(sourceRef: string, targetRef: string): SequenceFlow {
        const node = this.getNodeMap().get(sourceRef);
        if (node) {
            const sequenceFlow = node.connection.find(tmp => tmp.targetRef === targetRef);
            return sequenceFlow;
        } else {
            return null;
        }
    }

    public addNode(name: string, type: string, left: number, top: number) {

        const node = this.createNodeByType(type);

        node.id = this.createId();
        node.name = name;
        node.type = type;
        node.parentId = this.rootNodeId;

        const workflowPos = new Position();
        workflowPos.left = left;
        workflowPos.top = top;

        node.position = workflowPos;

        this.planModel.nodes.push(node);
    }

    private createNodeByType(type: string): WorkflowNode {
        if (type === 'startEvent') {
            return new StartEvent();
        }else if (type === 'restTask') {
            return new RestTask();
        } else if (type === 'toscaNodeManagementTask') {
            return new ToscaNodeTask();
        } else if (type === 'subProcess') {
            return new SubProcess();
        } else if (type === 'intermediateCatchEvent') {
            return new IntermediateCatchEvent();
        }else {
            return new WorkflowNode();
        }
    }

    public changeParent(id: string, originalParentId: string, targetParentId: string) {
        if (originalParentId === targetParentId) {
            return;
        }

        const node: WorkflowNode = this.deleteNode(originalParentId, id);
        node.parentId = targetParentId;

        if (targetParentId) {
            this.addChild(targetParentId, node);
        } else {
            this.planModel.nodes.push(node);
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
            if (node instanceof SubProcess) {
                const childNode = <SubProcess>node.children.find(child => child.id === id);
                if (childNode) {
                    parentNode = node;
                }
            }

        });

        return parentNode;
    }

    public isDescendantNode(node: WorkflowNode, descendantId: string): boolean {
        if (!(node instanceof SubProcess)) {
            return false;
        }
        const tmp = (<SubProcess>node).children.find(child => {
            return child.id === descendantId || (child instanceof SubProcess && this.isDescendantNode(<SubProcess>child, descendantId));
        });

        return tmp !== undefined;
    }

    private toNodeMap(nodes: WorkflowNode[], map: Map<string, WorkflowNode>) {
        nodes.forEach(node => {
            if (node.type === 'subProcess') {
                this.toNodeMap((<SubProcess>node).children, map);
            }
            map.set(node.id, node);
        });
    }

    public addConnection(sourceId: string, targetId: string) {
        const node = this.getNodeMap().get(sourceId);
        if (node) {
            const index = node.connection.findIndex(sequenceFlow => sequenceFlow.targetRef === targetId);
            if (index === -1) {
                const sequenceFlow = new SequenceFlow();
                sequenceFlow.sourceRef = sourceId;
                sequenceFlow.targetRef = targetId;

                node.connection.push(sequenceFlow);
            }
        }
    }

    public deleteConnection(sourceId: string, targetId: string) {
        const node = this.getNodeMap().get(sourceId);
        if (node) {
            const index = node.connection.findIndex(sequenceFlow => sequenceFlow.targetRef === targetId);
            if (index !== -1) {
                node.connection.splice(index, 1);
            }
        }
    }

    public deleteNode(parentId: string, nodeId: string): WorkflowNode {
        const nodeMap = this.getNodeMap();

        const nodes = this.getChildrenNodes(parentId);

        // delete related connections
        nodes.forEach(node => this.deleteConnection(node.id, nodeId));

        // delete current node
        const index = nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            const node = nodes.splice(index, 1)[0];
            node.connection = [];
            return node;
        }

        return null;
    }

    public addChild(parentId: string, child: WorkflowNode) {
        this.getChildrenNodes(parentId).push(child);
    }

    public deleteChild(node: SubProcess, id: string): WorkflowNode {
        const index = node.children.findIndex(child => child.id === id);
        if (index !== -1) {
            const deletedNode = node.children.splice(index, 1);
            return deletedNode[0];
        }

        return null;
    }

    public save() {
        console.log('****************** save data *********************');
        console.log(this.planModel);
        console.log(JSON.stringify(this.planModel));

        this.broadcastService.broadcast(this.broadcastService.saveEvent, this.planModel);
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
