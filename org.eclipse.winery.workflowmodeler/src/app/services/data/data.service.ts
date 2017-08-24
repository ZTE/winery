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

import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NoticeService } from '../notice.service';
import { BroadcastService } from './../broadcast.service';
import {BackendService} from './backend.service';
import {HttpService} from '../../util/http.service';
import {WineryService} from './winery.service';
import {CatalogService} from './catalog.service';

/**
 * DataService
 * BackendService factory, provide backend service by running environment.
 */
@Injectable()
export class DataService {
    private environment = 'Catalog'; // 'Winery', 'Catalog'
    public service: BackendService;

    constructor(private broadcastService: BroadcastService,
                private noticeService: NoticeService,
                protected httpService: HttpService) {
        this.createBackendService();
    }

    public getBackendType():string{
        return this.service.getBackendType();
    }

    private createBackendService() {
        switch (this.environment) {
            case 'Catalog':
                this.service = new CatalogService(this.broadcastService, this.noticeService, this.httpService);
                break;
            default:
                this.service = new WineryService(this.broadcastService, this.noticeService, this.httpService);
                break;
        }
    }
}
