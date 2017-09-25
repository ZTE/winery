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

import { Component, Input, OnChanges, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { TreeNode } from 'primeng/primeng';

import { PlanTreeviewItem } from '../../../model/plan-treeview-item';
import { ValueSource } from '../../../model/value-source.enum';
import { ValueType } from '../../../model/value-type.enum';
import { Parameter } from '../../../model/workflow/parameter';
import { RestTask } from '../../../model/workflow/rest-task';
import { SwaggerTreeConverterService } from '../../../services/swagger-tree-converter.service';
import { WorkflowUtil } from '../../../util/workflow-util';
import { Swagger } from "../../../model/swagger";
import { RestService } from "../../../services/rest.service";

/**
 * parameter tree presents parameter of task node's input and output parameters.
 */
@Component({
    selector: 'b4t-parameter-tree',
    styleUrls: ['./parameter-tree.component.css'],
    templateUrl: 'parameter-tree.component.html',
})
export class ParameterTreeComponent implements OnChanges {
    @Input() public parameters: TreeNode[];
    @Input() public task: RestTask;
    @Input() public defaultValueSource: string;
    @Input() public valueSource: ValueSource[];
    @Input() public planItems: PlanTreeviewItem[];

    constructor(private restService: RestService, private swaggerTreeConverterService: SwaggerTreeConverterService) { }

    public ngOnChanges(changes: SimpleChanges) {
    }

    public getParameter(node: any): Parameter {
        return new Parameter(node.label, node.value.value, node.value.valueSource, node.definition.type, node.definition.reqquired);
    }


    public paramChange(param: Parameter, node: any) {
        node.value.valueSource = param.valueSource;
        node.value.value = param.value;

        this.objectParameterChange(node);

        if (node.label !== param.name) {
            delete node.parent.value.value[node.label];
            node.label = param.name;
        }
        if (node.parent) {
            node.parent.value.value[node.label] = node.value;
        } else {
            console.warn('Node.parent does not exists!' + JSON.stringify(node));
        }

    }

    private objectParameterChange(node: any) {
        if (node.value.valueSource === ValueSource[ValueSource.Definition]) { // value will be set by node defintion
            const treeNode = this.swaggerTreeConverterService.schema2TreeNode(this.getSwagger(), node.label, node.definition, node.value);
            node.value = treeNode.value;
            node.children = treeNode.children;
        } else {  // parameter value will be set by param
            node.children = [];
        }
    }

    private getSwagger(): Swagger {
        return this.restService.getSwaggerInfo(this.task.restConfigId);
    }

    public addChildNode4DynamicObject(node: any) {
        const copyItem = WorkflowUtil.deepClone(node.definition.additionalProperties);
        const key = Object.keys(node.value.value).length;

        const childrenNode = this.swaggerTreeConverterService
            .schema2TreeNode(this.getSwagger(), key, copyItem);

        childrenNode.keyEditable = true;
        node.value.value[key] = childrenNode.value;

        node.children.push(childrenNode);
    }

    public addChildNode4ObjectArray(node: any) {
        const copyItem = WorkflowUtil.deepClone(node.definition.items);

        const childrenNode = this.swaggerTreeConverterService
            .schema2TreeNode(
            this.getSwagger(),
            node.children.length,
            copyItem);

        node.value.value.push(childrenNode.value);
        node.children.push(childrenNode);
    }

    public deleteTreeNode(node: any) {
        if ('array' === node.parent.type) {
            // delete data
            node.parent.value.value.splice(node.label, 1);
            node.parent.children.splice(node.label, 1);

            // update node index
            node.parent.children.forEach((childNode, index) => childNode.label = index);
        } else if ('map' === node.parent.type) {
            delete node.parent.value.value[node.label];
            for (let index = 0; index < node.parent.children.length; index++) {
                const element = node.parent.children[index];
                if (element.label === node.label) {
                    node.parent.children.splice(index, 1);
                    break;
                }
            }
        }
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

    public getObjectValueSource(): ValueSource[] {
        const result = [];
        result.push(ValueSource.Definition);
        this.valueSource.forEach(source => result.push(source));
        return result;
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
