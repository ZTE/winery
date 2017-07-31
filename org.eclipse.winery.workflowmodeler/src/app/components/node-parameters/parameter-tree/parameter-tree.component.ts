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

import { Component, Input, Output } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { RestTask } from '../../../model/workflow/rest-task';
import { RestService } from '../../../services/rest.service';
import { SwaggerTreeConverterService } from '../../../services/swagger-tree-converter.service';
import { WorkflowUtil } from '../../../util/workflow-util';

/**
 * parameter tree presents parameter of task node's input and output parameters.
 */
@Component({
    selector: 'b4t-parameter-tree',
    templateUrl: 'parameter-tree.component.html',
})
export class WmParameterTreeComponent {
    @Input() public parameters: any;
    @Input() public task: RestTask;

    private restService: RestService;
    private swaggerTreeConverterService: SwaggerTreeConverterService;

    constructor(swaggerTreeConverterService: SwaggerTreeConverterService) {
        this.swaggerTreeConverterService = swaggerTreeConverterService;
    }

    public addChildNode4DynamicObject(node: any) {
        const copyItem = WorkflowUtil.deepClone(node.parameter.additionalProperties);
        const key = Object.keys(node.parameter.value).length;
        const childrenNode = this.swaggerTreeConverterService
            .schema2TreeNode(key, this.task.swagger, copyItem);

        childrenNode.keyEditable = true;
        node.parameter.value[key] = childrenNode.parameter.value;

        node.children.push(childrenNode);
    }

    public propertyKeyChanged(node: any, newKey: string) {
        const value = node.parent.parameter.value[node.label];
        node.parent.parameter.value[newKey] = value;
        delete node.parent.parameter.value[node.label];

        node.label = newKey;
    }

    public addChildNode4ObjectArray(node: any) {
        const copyItem = WorkflowUtil.deepClone(node.parameter.items);
        const childrenNode = this.swaggerTreeConverterService
            .schema2TreeNode(
                node.children.length,
                this.task.swagger,
                copyItem);

        node.parameter.value.push(childrenNode.parameter.value);

        node.children.push(childrenNode);
    }

    public deleteTreeNode(node: any) {
        // delete data
        node.parent.parameter.value.splice(node.label, 1);
        node.parent.children.splice(node.label, 1);

        // update node index
        node.parent.children.forEach((childNode, index) => childNode.label = index);
    }

    public canEditValue(node: any): boolean {
        return node.children.length === 0;
    }

    public canDelete(node: any) {
        const parent = node.parent;
        if (parent &&
            (this.isArrayObject(parent) || this.isDynamicObject(parent))) {
            return true;
        } else {
            return false;
        }
    }

    public updateObjectValue(node: any, value: string) {
        const newValueObj = JSON.parse(value);
        for (const key in node.parameter.value) {
            delete node.parameter.value[key];
        }

        for (const key in newValueObj) {
            node.parameter.value[key] = newValueObj[key];
        }
    }

    public getObjectValue(node) {
        return JSON.stringify(node.parameter.value);
    }

    public canAdd(node: any) {
        return this.isArrayObject(node) || this.isDynamicObject(node);
    }

    private isArrayObject(node: any): boolean {
        return node.type === 'array';
    }

    private isDynamicObject(node: any): boolean {
        return node.type === 'map';
    }
}
