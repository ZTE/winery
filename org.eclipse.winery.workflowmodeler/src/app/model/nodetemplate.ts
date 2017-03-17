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

import {Interface} from "./interface";

export class NodeTemplate {
    id:string;
    name:string;
    namespace:string;
    properties:string[] = [];
    interfaces:Interface[] = [];

    top:any;
    left:any;

    constructor(id:string,
                name:string,
                namespace:string,
                top:any,
                left:any) {
        this.id = id;
        this.name = name;
        this.namespace = namespace;
        this.top = top;
        this.left = left;
    }
}