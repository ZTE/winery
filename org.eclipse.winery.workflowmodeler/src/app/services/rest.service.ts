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
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { isNullOrUndefined } from 'util';

import { SwaggerMethod } from '../model/swagger';
import { SwaggerResponse } from '../model/swagger';
import { Swagger, SwaggerSchemaObject } from '../model/swagger';
import { RestConfig } from '../model/rest-config';
import { HttpService } from '../util/http.service';
import { BroadcastService } from './broadcast.service';
import { NoticeService } from './notice.service';

@Injectable()
export class RestService {

    private restConfigs: RestConfig[] = [];

    constructor(private broadcastService: BroadcastService, private http: Http, private noticeService: NoticeService) {
        this.initSwaggerInfoByMSB();
    }

    // public addRestConfig(): RestConfig {
    //     let index = 0;
    //     this.restConfigs.forEach(config => {
    //         const currentId = parseInt(config.id);
    //         if (currentId > index) {
    //             index = currentId;
    //         }
    //     });

    //     index += 1;

    //     const restConfig = new RestConfig(index.toString(), 'new Config', '', '', false);
    //     this.restConfigs.push(restConfig);

    //     return restConfig;
    // }

    // public initSwaggerInfo(restConfig: RestConfig) {
    //     if (restConfig.dynamic && restConfig.definition) {
    //         this.getDynamicSwaggerInfo(restConfig.definition).subscribe(response => restConfig.swagger = new Swagger(response));
    //     } else {
    //         restConfig.swagger = new Swagger(restConfig.swagger);
    //     }
    // }

    public getRestConfigs() {
        return this.restConfigs;
    }

    // public getDynamicSwaggerInfo(url: string): Observable<any> {
    //     const options: any = {
    //         headers: {
    //             Accept: 'application/json',
    //         },
    //     };
    //     return this.httpService.get(url, options);
    // }

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

    private initSwaggerInfoByMSB(): void {
        const options: any = {
            headers: {
                Accept: 'application/json',
            }
        };
        let restConfigs = this.restConfigs;
        this.http.get('/api/msdiscover/v1/services').subscribe(response => {
            if (!Array.isArray(response.json())) {
                return;
            }
            let services = response.json();
            let swaggerObservableArray: Observable<any>[] = [];
            services.forEach(serviceInfo => {
                if ('REST' === serviceInfo.protocol) {
                    // this service don't have sawgger file.
                    if ('workflow-tomcat' !== serviceInfo.serviceName && 'activiti-rest' !== serviceInfo.serviceName) {
                        restConfigs.push(new RestConfig(serviceInfo.serviceName + '.' + serviceInfo.version,
                            serviceInfo.serviceName, serviceInfo.version, serviceInfo.url));
                        let swaggerUrl: string = '';
                        if (undefined !== serviceInfo.swagger_url && '' !== serviceInfo.swagger_url) {
                            swaggerUrl = serviceInfo.url + serviceInfo.swagger_url;
                        } else {
                            // default swagger url is: '/swagger.json'
                            swaggerUrl = serviceInfo.url + '/swagger.json';
                        }
                        swaggerObservableArray.push(this.http.get(swaggerUrl, options).catch((error): Observable<any> => {
                            console.log('Request swagger from:"' + swaggerUrl + '" faild!');
                            return Observable.of(null);
                        }));
                    }
                }
            });
            Observable.forkJoin(swaggerObservableArray).subscribe(
                responses => {
                    let deleteArray: number[] = [];
                    responses.forEach((response, index) => {
                        // mark http get failed request index or set the swagger into restConfigs
                        if (null === response) {
                            deleteArray.push(index);
                        } else {
                            const swagger = response.json();
                            if ('2.0' === swagger.swagger) {
                                restConfigs[index].swagger = new Swagger(response.json());
                            } else {
                                deleteArray.push(index);
                                console.log('Do not support this sawgger file format:' + swagger);
                            }
                        }
                    });
                    console.log('Get all swagger file finish.');
                    // delete failed request from all restConfigs array
                    deleteArray.reverse();
                    deleteArray.forEach(deleteIndex => {
                        restConfigs.splice(deleteIndex, 1);
                    })
                    this.broadcastService.broadcast(this.broadcastService.updateModelRestConfig, restConfigs);
                    this.noticeService.info('Load all swagger finished.');
                }
            );
        });
    };
}

