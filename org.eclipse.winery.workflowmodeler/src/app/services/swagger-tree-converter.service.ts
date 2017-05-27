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

import {Injectable} from "@angular/core";
import {RestService} from './rest.service';
import {TreeNode} from 'primeng/primeng';

@Injectable()
export class SwaggerTreeConverterService {

    private swaggerUrl: string;

    constructor(private restService: RestService) {

    }

    //public schema2TreeNode(key: string, swaggerUrl: string, schema: any): any {
    //    if(schema.$ref) {
    //        let treeNode = this.getTreeNodeBySwaggerDefinition(key, swaggerUrl, schema.$ref);
    //        return treeNode;
    //    } else {
    //        return this.parameter2TreeNode(key, schema);
    //    }
    //}
    //
    //private getTreeNodeBySwaggerDefinition(key: string, swaggerUrl: string, ref: string): TreeNode {
    //    let swagger = this.restService.getSwaggerInfo(swaggerUrl);
    //    let swaggerDefinition = this.restService.getDefinition(swagger, ref);
    //
    //    let copyDefinition = this.restService.deepClone(swaggerDefinition);
    //
    //    return this.parameter2TreeNode(key, copyDefinition);
    //}
    //
    //private parameter2TreeNode(name: string,  paramDefinition: any): TreeNode {
    //    let nodeType = (paramDefinition.type === "array" || paramDefinition.type === 'object') ? paramDefinition.type : 'default';
    //
    //    let node = {
    //        "label": name,
    //        "type": nodeType,
    //        "children": [],
    //        "parameter": paramDefinition,
    //    };
    //
    //    if(paramDefinition.type === 'object') {
    //        node.children = this.getPropertyFromObject(paramDefinition.properties.propertiesObj);
    //    } else if(paramDefinition.type === 'array') {
    //        this.setChildrenForArray(node, paramDefinition);
    //    }
    //
    //    return node;
    //}
    //
    //private setChildrenForArray(node: any, param: any) {
    //    if(!param.value) {
    //        param.value = [];
    //    } else {
    //        param.value.forEach((child, index) =>
    //            node.children.push(this.parameter2TreeNode(index + '', child)));
    //    }
    //}
    //
    //private getPropertyFromObject(properties: any): TreeNode[] {
    //    let treeNodes: TreeNode[] = [];
    //    for(let key in properties) {
    //        treeNodes.push(this.parameter2TreeNode(key, properties[key]));
    //    }
    //    return treeNodes;
    //}

    public schema2TreeNode(key: string | number, swaggerUrl: string, schema: any): any {
        this.swaggerUrl = swaggerUrl;

        if(schema.$ref) {
            let treeNode = this.getTreeNodeBySwaggerDefinition(key, schema);
            return treeNode;
        } else {
            this.setInitValue4Param(schema.value, schema);
            return this.parameter2TreeNode(key, schema);
        }
    }

    private getTreeNodeBySwaggerDefinition(key: string | number, schema: any): TreeNode {
        let swagger = this.restService.getSwaggerInfo(this.swaggerUrl);
        let swaggerDefinition = this.restService.getDefinition(swagger, schema.$ref);

        let definitionCopy = this.restService.deepClone(swaggerDefinition);

        this.setInitValue4Param(schema.value, definitionCopy);
        if(schema.value !== definitionCopy.value) {
            schema.value = definitionCopy.value;
        }

        return this.schema2TreeNode(key, this.swaggerUrl, definitionCopy);
    }

    private setInitValue4Param(value: any | any[], param: any) {
        param.value = value;
        if(value == null) {
            if(param.type === 'object') {
                param.value = {};
            } else if(param.type === 'array') {
                param.value = [];
            }
        }
    }

    private parameter2TreeNode(name: string | number, paramDefinition: any): any {
        let nodeType = this.getTreeNodeType(paramDefinition);

        let node = {
            "label": name,
            "type": nodeType,
            "children": [],
            "parameter": paramDefinition,
        };

        if(paramDefinition.type === 'object') {
            node.children = this.getPropertyFromObject(paramDefinition.value, paramDefinition);
        } else if(paramDefinition.type === 'array') {
            this.setChildrenForArray(node, paramDefinition);
        }

        return node;
    }

    private getTreeNodeType(param: any): string {
        const type = param.type;
        if(type === 'array') {
            return 'array';
        } else if(type === 'object') {
            if(param.additionalProperties) {
                return 'map';
            } else {
                return 'object';
            }
        } else {
            return 'default';
        }
    }

    private setChildrenForArray(node: any, param: any) {
        param.value.forEach((itemValue, index) =>{
            let itemCopy = this.restService.deepClone(param.items);
            itemCopy.value = itemValue;
            node.children.push(this.schema2TreeNode(index, this.swaggerUrl, itemCopy));
        });
    }

    private getPropertyFromObject(objectValue: any, param: any): TreeNode[] {
        if(param.properties) {
            return this.getPropertyFromSimpleObject(objectValue, param.properties);
        } else if(param.additionalProperties) {
            return this.getPropertyFromMapOrDictionary(objectValue, param.additionalProperties);
        } else {
            return [];
        }

    }

    private getPropertyFromSimpleObject(objectValue: any, properties: any): TreeNode[] {
        let treeNodes: TreeNode[] = [];
        for(let key in properties) {
            let property = properties[key];
            this.setInitValue4Param(objectValue[key], property);

            if(property.value !== objectValue[key]) {
                objectValue[key] = property.value;
            }

            treeNodes.push(this.schema2TreeNode(key, this.swaggerUrl, property));
        }
        return treeNodes;
    }

    private getPropertyFromMapOrDictionary(mapOrDictionary: any, additionalProperties: any): TreeNode[] {
        let treeNodes: TreeNode[] = [];
        for(let key in mapOrDictionary) {
            let propertyCopy = this.restService.deepClone(additionalProperties);
            propertyCopy.value = mapOrDictionary[key];

            let treeNode = this.schema2TreeNode(key, this.swaggerUrl, propertyCopy);
            treeNode.keyEditable = true;
            treeNodes.push(treeNode);

            if(mapOrDictionary[key] !== propertyCopy.value) {
                mapOrDictionary[key] = propertyCopy.value;
            }
        }
        return treeNodes;
    }
}
