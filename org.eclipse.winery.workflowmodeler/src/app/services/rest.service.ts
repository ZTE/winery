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

import { SwaggerMethod } from '../model/swagger';
import { SwaggerResponse } from '../model/swagger';
import { Swagger, SwaggerSchemaObject } from '../model/swagger';
import { RestConfig } from '../model/rest-config';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';

@Injectable()
export class RestService {

    private restConfigs: Array<RestConfig> = new Array();

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

    public addRestConfig(): RestConfig {
        let index = 0;
        this.restConfigs.forEach(config => {
            const currentId = parseInt(config.id);
            if(currentId > index) {
                index = currentId;
            }
        });

        index += 1;

        const restConfig = new RestConfig(index.toString(), 'new Config', '', '', false);
        this.restConfigs.push(restConfig);
        
        return restConfig;
    }

    public initSwaggerInfo(restConfig: RestConfig) {
        if (restConfig.dynamic && restConfig.definition) {
            this.getDynamicSwaggerInfo(restConfig.definition).subscribe(response => restConfig.swagger = new Swagger(response));
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

    public getSwaggerInfo(id: string): Swagger {
        const restConfig = this.restConfigs.find(tmp => tmp.id === id);
        return restConfig === undefined ? undefined : restConfig.swagger;
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

}
