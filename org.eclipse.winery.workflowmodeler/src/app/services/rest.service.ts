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
import {SwaggerPath} from "../model/swagger";
import {SwaggerMethod} from "../model/swagger";
import {SwaggerResponse} from "../model/swagger";
import {SwaggerDefinition} from "../model/swagger";
import {SwaggerItems} from "../model/swagger";
import {HttpService} from '../util/http.service';

@Injectable()
export class RestService {

    private restConfigs: {name: string, baseUrl: string, swagger?: Swagger}[] = [
        {name:"service1", baseUrl:"http://www.service1.lcom"},
        {name:"service2", baseUrl:"http://www.service2.lcom"},
        {name:"service3", baseUrl:"http://www.service3.lcom"},
    ];

	constructor(
        private broadcastService: BroadcastService,
        private httpService: HttpService) {
	}

    public getRestConfigs() {
        return this.restConfigs;
    }

    public setRestConfigs(restConfigs: {name: string, baseUrl: string, swagger: any}[]) {
        restConfigs.forEach(restConfig => restConfig.swagger = new Swagger(restConfig.swagger));
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
		let result = [];
		let path: SwaggerPath = swagger.paths.paths[interfaceUrl];
		let method: SwaggerMethod = path.methodObj[operation];
		let response: SwaggerResponse = method.responses.responseObj["200"];

		if(response && response.schema && response.schema.$ref) {
			// just obtain the first level param, it has to get the complete param in future
			let definition: SwaggerDefinition = this.getDefinition(swagger, response.schema.$ref);
			for(let key of Object.keys(definition.properties.propertiesObj)) {
				let item: SwaggerItems = definition.properties.propertiesObj[key];
				result.push({
					name: key,
					type: item.type,
					value:"",
				});
			}
		}

		return result;
	}

	public getDefinition(swagger: Swagger, position: string): SwaggerDefinition {
		let definitionName = position.substring("#/definitions/".length);
		return swagger.definitions.definitionObj[definitionName];
	}
}
