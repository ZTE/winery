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

export const WorkflowNodeType = [
    "StartEvent",
    "EndEvent",
    "ToscaNodeManagementTask",
    "ExclusiveGateway",
    "ParallelGateway",
];

export class WorkflowNode {
    id:string;
    name:string;
    type:string;
    input:any[];
    output:any[];

    connection:any[];

    template:any;

    position:any;

    interface:string;
    node_template:string;
    node_operation;
    string;

    constructor(option:any) {
        this.id = option.id;
        this.name = option.name;
        this.type = option.type;
        this.position = option.position;
        this.input = option.input || [];
        this.connection = option.connection || [];
        this.output = option.output || [];

        this.template = option.template || {};

        this.interface = option.interface || "";
        this.node_operation = option.node_operation || "";
        this.node_template = option.node_template || "";
    }

    addConnection(targetId) {
        if (!this.connection.includes(targetId)) {
            this.connection.push(targetId);
        }
    }

    deleteConnection(targetId:string) {
        let index = this.connection.findIndex(target => target == targetId);
        if (index != -1) {
            this.connection.splice(index, 1);
        }
    }

}
