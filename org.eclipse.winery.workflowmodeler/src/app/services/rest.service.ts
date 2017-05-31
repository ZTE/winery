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
import {isNullOrUndefined} from "util";
import {NodeTemplate} from "../model/nodetemplate";
import {Operation} from "../model/operation";
import {BroadcastService} from "./broadcast.service";
import {SwaggerData} from "../model/swagger.data";
import {Swagger} from "../model/swagger";
import {SwaggerMethod} from "../model/swagger";
import {SwaggerResponse} from "../model/swagger";
import {HttpService} from '../util/http.service';
import {SwaggerSchemaObject} from '../model/swagger';

@Injectable()
export class RestService {

    private restConfigs: {name: string, baseUrl: string, swagger?: Swagger}[] = [
    ];

	constructor(
        private broadcastService: BroadcastService,
        private httpService: HttpService) {

        this.broadcastService.planModel$.subscribe(planModel => {
            if(!planModel.configs.restConfigs) {
                planModel.configs.restConfigs = [];
            } else {
                planModel.configs.restConfigs.forEach(restConfig => restConfig.swagger = new Swagger(restConfig.swagger));
            }

            this.restConfigs = planModel.configs.restConfigs;
        });
	}

    public getRestConfigs() {
        return this.restConfigs;
    }

    public setRestConfigs(restConfigs: {name: string, baseUrl: string, swagger: any}[]) {
        restConfigs.forEach(config => {
            delete config.swagger;
            console.log(JSON.stringify(config));
        });
        restConfigs.forEach(restConfig => restConfig.swagger = new Swagger(restConfig.swagger));

        restConfigs.forEach(config => {
            console.log(JSON.stringify(config.swagger));
        });

        this.restConfigs = restConfigs;
    }

	public getInterfaces(url: string) {
        let options: any = {headers: {
            'Accept': 'application/json',
        }};
        this.httpService.get(url, options).subscribe(response => {
            this.broadcastService.broadcast(this.broadcastService.swagger, response);
        });
	}

    public getSwaggerInfo(baseUrl: string): Swagger {
        let restConfig = this.restConfigs.find(tmp => tmp.baseUrl == baseUrl);
        return restConfig == null ? null : restConfig.swagger;
    }

	public getResponseParameters(swagger: Swagger, interfaceUrl: string, operation: string): any[] {
		let path = swagger.paths[interfaceUrl];
		let method: SwaggerMethod = path[operation];
		let response: SwaggerResponse = null;

        for(let key of Object.keys(method.responses)) {
            if(key.startsWith("20")) {
                response = method.responses[key];
            }
        }

		return [response];
	}

	public getDefinition(swagger: Swagger, position: string): SwaggerSchemaObject {
		let definitionName = position.substring("#/definitions/".length);

		return swagger.definitions[definitionName];
	}

    public deepClone(source: any) {
        if(source == null || typeof source != 'object') {
            return source;
        } else {
            if(source instanceof Array) {
                let target = [];
                source.forEach(item => target.push(this.deepClone(item)));
                return target;
            } else {
                let target = {};
                for(let key in source) {
                    target[key] = this.deepClone(source[key]);
                }
                return target;
            }
        }
        //
        //let nu = null;
        //let und = undefined;
        //
        //let a = [1,3,3,4];
        //let o = {key:'a', name: 'value'};
        //let b = true;
        //let s = 'string';
        //let n = 1;
        //
        //let $ref = '$ref';
        //let ref = new SwaggerReference({$ref});
        //
        //
        //console.log(`nu == null ${nu == null}`);
        //console.log(`instance of Object nu ${nu instanceof Object}`);
        //console.log(`type of nu ${typeof nu}`);
        //console.log(`instance of Object und ${und instanceof Object}`);
        //console.log(`type of und ${typeof und}`);
        //
        //console.log(`instance of Object ref ${a instanceof Object}`);
        //console.log(`instance of SwaggerReference ref ${a instanceof SwaggerReference}`);
        //
        //console.log(`instance of Array a ${a instanceof Array}`);
        //console.log(`instance of Object a ${a instanceof Object}`);
        //console.log(`type of a ${typeof a}`);
        //
        //console.log(`instance of Object o ${o instanceof Object}`);
        //console.log(`instance of Array o ${o instanceof Array}`);
        //console.log(`type of o ${typeof o}`);
        //
        //console.log(`type of b ${typeof b}`);
        //console.log(`type of s ${typeof s}`);
        //console.log(`type of n ${typeof n}`);

    }



}
