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
import { Headers, Http } from '@angular/http';
import './rxjs-operators';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class HttpService {
    headers:any;

    constructor(private http:Http) {
        this.headers = new Headers({
            'Content-Type': 'application/json'
        });
    }

    get(uri:string) {
        return this.getHttp('get', uri);
    }

    post(uri:string, data:any) {
        return this.getHttp('post', uri, data);
    }

    put(uri:string, data:any) {
        return this.getHttp('put', uri, data);
    }

    delete(uri:string) {
        return this.getHttp('delete', uri);
    }

    getHttp(type:string, uri:string, data?:any) {
        if (data) {
            return this.http[type](uri, JSON.stringify(data), {headers: this.headers}).catch(this.handleError);
        } else {
            return this.http[type](uri, {headers: this.headers}).catch(this.handleError);
        }
    }

    handleError(error:any) {
        let errMsg = (error.message) ? error.message : error.status ? `${error.status}-${error.statusText}` : 'Server error';
        return Observable.throw(errMsg);
    }
}