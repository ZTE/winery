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
	//public serviceResources: any[] = [
	//	{
	//		name:"ms1",
	//		url:"http://10.74.148.130:10080/api/microservices/v1/swagger.json"
	//	},
	//	{
	//		name:"ms2",
	//		url:"http://10.74.148.130:10080/api/microservices/v1/swagger.json"
	//	},
	//];

    private swaggers: {name: string, baseUrl: string, swagger: Swagger}[] = [];

	constructor(
        private broadcastService: BroadcastService,
        private httpService: HttpService) {
		//this.broadcastService.serviceSource$.subscribe(sources => this.serviceResources = sources);
	}

    public setSwaggers(swaggers: {name: string, baseUrl: string, swagger: any}[]) {
        swaggers.forEach(swaggerInfo => swaggerInfo.swagger = new Swagger(swaggerInfo.swagger));
        this.swaggers = swaggers;
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
        let swaggerInfo = this.swaggers.find(tmp => tmp.baseUrl == baseUrl);
        return swaggerInfo == null ? null : swaggerInfo.swagger;
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
