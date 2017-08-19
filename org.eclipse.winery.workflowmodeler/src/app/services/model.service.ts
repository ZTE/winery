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
import { PlanTreeviewItem } from '../model/plan-treeview-item';
import { Swagger, SwaggerModel, SwaggerModelSimple, SwaggerPrimitiveObject, SwaggerReferenceObject } from '../model/swagger';
import { IntermediateCatchEvent } from '../model/workflow/intermediate-catch-event';
import { NodeType } from '../model/workflow/node-type.enum';
import { Position } from '../model/workflow/position';
import { RestTask } from '../model/workflow/rest-task';
import { SequenceFlow } from '../model/workflow/sequence-flow';
import { StartEvent } from '../model/workflow/start-event';
import { SubProcess } from '../model/workflow/sub-process';
import { ToscaNodeTask } from '../model/workflow/tosca-node-task';
import { WorkflowNode } from '../model/workflow/workflow-node';
import { BroadcastService } from './broadcast.service';
import { RestService } from './rest.service';
import { SwaggerTreeConverterService } from './swagger-tree-converter.service';

/**
 * ModelService
 * provides all operations about plan model.
 */
@Injectable()
export class ModelService {
    public rootNodeId = 'root';

    private planModel: PlanModel = new PlanModel();

    constructor(private broadcastService: BroadcastService, private restService: RestService) {
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
        switch (type) {
            case NodeType[NodeType.startEvent]:
                return new StartEvent();
            case NodeType[NodeType.restTask]:
                return new RestTask();
            case NodeType[NodeType.toscaNodeManagementTask]:
                return new ToscaNodeTask();
            case NodeType[NodeType.subProcess]:
                return new SubProcess();
            case NodeType[NodeType.intermediateCatchEvent]:
                return new IntermediateCatchEvent();
            default:
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

    public getPlanParameters(nodeId: string): PlanTreeviewItem[] {
        const preNodeList = new Array<WorkflowNode>();
        this.getPreNodes(nodeId, this.getNodeMap(), preNodeList);

        return this.loadNodeOutputs(preNodeList);
    }

    private loadNodeOutputs(nodes: WorkflowNode[]): PlanTreeviewItem[] {
        const params = new Array<PlanTreeviewItem >();
        nodes.forEach(node => {
            switch (node.type) {
                case NodeType[NodeType.startEvent]:
                    params.push(this.loadOutput4StartEvent(<StartEvent>node));
                    break;
                case NodeType[NodeType.toscaNodeManagementTask]:
                    params.push(this.loadOutput4ToscaNodeTask(<ToscaNodeTask>node));
                    break;
                case NodeType[NodeType.restTask]:
                    params.push(this.loadOutput4RestTask(<RestTask>node));
                    break;
                default:
                    break;
            }
        });

        return params;
    }

    private loadOutput4StartEvent(node: StartEvent): PlanTreeviewItem {
        const startItem = new PlanTreeviewItem(node.name, `[${node.id}]`, []);
        node.parameters.map(param =>
            startItem.children.push(new PlanTreeviewItem(param.name, `${startItem.value}.[${param.name}]`, [])));
        return startItem;
    }

    private loadOutput4ToscaNodeTask(node: ToscaNodeTask): PlanTreeviewItem {
        const item = new PlanTreeviewItem(node.name, `[${node.id}]`, []);
        item.children.push(this.createStatusCodeTreeViewItem(node.id));
        const responseItem = this.createResponseTreeViewItem(node.id);
        item.children.push(responseItem);

        node.output.map(param =>
            responseItem.children.push(new PlanTreeviewItem(param.name, `${responseItem.value}.[${param.name}]`, [])));
        return item;
    }

    private loadOutput4RestTask(node: RestTask): PlanTreeviewItem {
        const item = new PlanTreeviewItem(node.name, `[${node.id}]`, []);
        item.children.push(this.createStatusCodeTreeViewItem(node.id));

        if (node.responses.length !== 0) { // load rest responses
            const responseItem = this.createResponseTreeViewItem(node.id);
            item.children.push(responseItem);
            if(node.responses[0]) {
                const swagger = this.restService.getSwaggerInfo(node.restConfigId);
                const swaggerDefinition = this.restService.getDefinition(swagger, node.responses[0].schema.$ref);
                this.loadParamsBySwaggerDefinition(responseItem, swagger, <SwaggerModelSimple>swaggerDefinition);
            }
        }

        return item;
    }

    private loadParamsBySwaggerDefinition(parentItem: PlanTreeviewItem, swagger: Swagger, definition: SwaggerModelSimple) {
        Object.getOwnPropertyNames(definition.properties).map(key => {
            const property = definition.properties[key];
            const value = `${parentItem.value}.[${key}]`;
            const propertyItem = new PlanTreeviewItem(key, value, []);
            parentItem.children.push(propertyItem);

            if (property instanceof SwaggerReferenceObject) {
                const propertyDefinition = this.restService.getDefinition(swagger, property.$ref);
                this.loadParamsBySwaggerDefinition(propertyItem, swagger,
                    <SwaggerModelSimple>propertyDefinition);
            }

            return propertyItem;
        });
    }

    private createStatusCodeTreeViewItem(nodeId: string): PlanTreeviewItem {
        return new PlanTreeviewItem('statusCode', `[${nodeId}].[statusCode]`, []);
    }

    private createResponseTreeViewItem(nodeId: string): PlanTreeviewItem {
        return new PlanTreeviewItem('response', `[${nodeId}].[response]`, []);
    }

    public getPreNodes(nodeId: string, nodeMap: Map<string, WorkflowNode>, preNodes: WorkflowNode[]) {
        const preNode4CurrentNode = [];
        nodeMap.forEach(node => {
            if (this.isPreNode(node, nodeId)) {
                const existNode = preNodes.find(tmpNode => tmpNode.id === node.id);
                if (existNode) {
                    // current node already exists. this could avoid loop circle.
                } else {
                    preNode4CurrentNode.push(node);
                    preNodes.push(node);
                }
            }
        });

        preNode4CurrentNode.forEach(node => this.getPreNodes(node.id, nodeMap, preNodes));
    }

    public isPreNode(preNode: WorkflowNode, id: string): boolean {
        const targetNode = preNode.connection.find(connection => connection.targetRef === id);
        return targetNode !== undefined;
    }

    public save() {
        console.log('****************** save data *********************');
        console.log(this.planModel);

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
