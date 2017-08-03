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
import { Position } from './position';
import { SequenceFlow } from './sequence-flow';
import { ValueSource } from '../value-source.enum';

export class WorkflowNode {
    public connection: SequenceFlow[] = [];
    public id: string;
    public name: string;
    public parentId: string;
    public position: Position;
    public type: string;
}
