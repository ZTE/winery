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

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { NodeTemplate } from '../model/nodetemplate';
import { Operation } from '../model/operation';
import { SwaggerMethod } from '../model/swagger';
import { SwaggerResponse } from '../model/swagger';
import { Swagger, SwaggerSchemaObject } from '../model/swagger';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';

@Injectable()
export class RestService {

    private restConfigs: Array<{
        name: string,
        baseUrl: string,
        dynamic: boolean,
        swagger?: Swagger,
    }> = new Array();

    constructor(private broadcastService: BroadcastService,
                private httpService: HttpService) {

        this.broadcastService.planModel$.subscribe(planModel => {
            if (!planModel.configs.restConfigs) {
                planModel.configs.restConfigs = [];
            } else {
                planModel.configs.restConfigs.forEach(restConfig => this.initSwaggerInfo(restConfig));
            }

            this.restConfigs = planModel.configs.restConfigs;
        });
    }

    public initSwaggerInfo(restConfig: {
        name: string,
        baseUrl: string,
        dynamic: boolean,
        swagger?: Swagger,
    }) {
        if (restConfig.dynamic) {
            this.getDynamicSwaggerInfo(restConfig.baseUrl).subscribe(response => restConfig.swagger = new Swagger(response));
        } else {
            restConfig.swagger = new Swagger(restConfig.swagger);
        }
    }

    public getRestConfigs() {
        return this.restConfigs;
    }

    public getDynamicSwaggerInfo(url: string): Observable<any> {
        const options: any = {
            headers: {
                Accept: 'application/json',
            },
        };
        return this.httpService.get(url, options);
    }

    public getSwaggerInfo(baseUrl: string): Swagger {
        const restConfig = this.restConfigs.find(tmp => tmp.baseUrl === baseUrl);
        return restConfig == null ? null : restConfig.swagger;
    }

    public getResponseParameters(swagger: Swagger, interfaceUrl: string, operation: string): any[] {
        const path = swagger.paths[interfaceUrl];
        const method: SwaggerMethod = path[operation];
        let response: SwaggerResponse = null;

        for (const key of Object.keys(method.responses)) {
            if (key.startsWith('20')) {
                response = method.responses[key];
            }
        }

        return [response];
    }

    public getDefinition(swagger: Swagger, position: string): SwaggerSchemaObject {
        const definitionName = position.substring('#/definitions/'.length);

        return swagger.definitions[definitionName];
    }

    public deepClone(source: any) {
        if (source === null || typeof source !== 'object') {
            return source;
        } else {
            if (source instanceof Array) {
                const target = [];
                source.forEach(item => target.push(this.deepClone(item)));
                return target;
            } else {
                const target = {};
                for (const key in source) {
                    target[key] = this.deepClone(source[key]);
                }
                return target;
            }
        }
    }

}
