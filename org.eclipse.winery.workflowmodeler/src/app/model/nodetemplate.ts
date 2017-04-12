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

import {Interface} from './interface';

export class NodeTemplate {
    public id: string;
    public name: string;
    public namespace: string;
    public properties: string[] = [];
    public interfaces: Interface[] = [];

    public top: number;
    public left: number;

    constructor(id: string,
                name: string,
                namespace: string,
                top: number,
                left: number) {
        this.id = id;
        this.name = name;
        this.namespace = namespace;
        this.top = top;
        this.left = left;
    }
}
