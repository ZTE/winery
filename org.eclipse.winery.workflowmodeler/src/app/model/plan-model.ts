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
import { WorkflowNode } from './workflow/workflow-node';

export class PlanModel {
    public nodes: WorkflowNode[];
    public configs: any;

    //public addNode(node: WorkflowNode) {
    //    this.nodes.push(node);
    //}
    //
    //public deleteNode(id: string): WorkflowNode {
    //    const index = this.nodes.findIndex(node => node.id === id);
    //    if (index !== -1) {
    //        const deletedNode = this.nodes.splice(index, 1);
    //        return deletedNode[0];
    //    }
    //    return null;
    //}

}
