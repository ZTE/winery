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

//noinspection TypeScriptCheckImport
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import {RouterModule} from '@angular/router';
import {HttpModule} from '@angular/http';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';

import {WmToolbarComponent} from './components/toolbar/toolbar.component';
import {AppRoutingModule} from "./app-routing.module";
import {WineryService} from "./services/winery.service";
import {HttpService} from "./util/http.service";
import {JsPlumbService} from "./services/jsplumb.service";
import {BroadcastService} from "./services/broadcast.service";
import {WmContainerComponent} from "./components/container/container.component";
import {WmNodeComponent} from "./components/node/node.component";
import {ModelService} from "./services/model.service";
import {WmPropertiesComponent} from "./components/property/properties.component";
import {WmParameterComponent} from "./components/parameter/parameter.component";
import {WmNodeTemplateComponent} from "./components/nodetemplate/nodetemplate.component";
import {SharedModule} from "./shared/shared.module";

@NgModule({
    declarations: [
        AppComponent,
        WmToolbarComponent,
        WmContainerComponent,
        WmNodeComponent,
        WmPropertiesComponent,
        WmParameterComponent,
        WmNodeTemplateComponent
    ],
    providers: [
        BroadcastService,
        HttpService,
        WineryService,
        JsPlumbService,
        ModelService
    ],
    imports: [
        BrowserModule,
        NgbModule.forRoot(),
        RouterModule.forRoot([]),
        AppRoutingModule,
        SharedModule
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
