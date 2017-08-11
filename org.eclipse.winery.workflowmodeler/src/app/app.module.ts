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

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AlertModule, ModalModule } from 'ngx-bootstrap/index';
import { Ng2BootstrapModule } from 'ngx-bootstrap';
import { NgxTreeSelectModule } from 'ngx-tree-select';

import { AppComponent } from './app.component';
import { WmContainerComponent } from './components/container/container.component';
import { WmEditablePropertyComponent } from './components/editable-property/editable-property.component';
import { WmNodeParametersComponent } from './components/node-parameters/node-parameters.component';
import { WmParameterTreeComponent } from './components/node-parameters/parameter-tree/parameter-tree.component';
import { WmNodeComponent } from './components/node/node.component';
import { WmParameterComponent } from './components/parameter/parameter.component';
import { IntermediateCatchEventComponent } from './components/property/intermediate-catch-event/intermediate-catch-event.component';
import { WmNodeTemplateComponent } from './components/property/node-template/node-template.component';
import { WmPropertiesComponent } from './components/property/properties.component';
import { WmRestTaskComponent } from './components/property/rest-task/rest-task.component';
import { StartEventParametersComponent } from './components/property/start-event-parameters/start-event-parameters.component';
import { WmSequenceFlowComponent } from './components/sequence-flow/sequence-flow.component';
import { WmRestConfigDetailComponent } from './components/toolbar/rest-config/rest-config-detail/rest-config-detail.component';
import { WmRestConfigListComponent } from './components/toolbar/rest-config/rest-config-list/rest-config-list.component';
import { WmRestConfigComponent } from './components/toolbar/rest-config/rest-config.component';
import { WmToolbarComponent } from './components/toolbar/toolbar.component';

import { ResizableDirective } from './directive/resizable/resizable.directive';

import { BroadcastService } from './services/broadcast.service';
import { DataService } from './services/data/data.service';
import { JsPlumbService } from './services/jsplumb.service';
import { ModelService } from './services/model.service';
import { NotifyService } from './services/notify.service';
import { RestService } from './services/rest.service';
import { SwaggerTreeConverterService } from './services/swagger-tree-converter.service';

import { SharedModule } from './shared/shared.module';
import { HttpService } from './util/http.service';

@NgModule({
    declarations: [
        AppComponent,
        WmContainerComponent,
        WmEditablePropertyComponent,
        IntermediateCatchEventComponent,
        WmNodeComponent,
        WmNodeParametersComponent,
        WmNodeTemplateComponent,
        WmParameterComponent,
        WmParameterTreeComponent,
        WmPropertiesComponent,
        WmRestConfigComponent,
        WmRestTaskComponent,
        WmSequenceFlowComponent,
        StartEventParametersComponent,
        WmToolbarComponent,
        WmRestConfigDetailComponent,
        WmRestConfigListComponent,
        ResizableDirective,
    ],
    providers: [
        BroadcastService,
        HttpService,
        JsPlumbService,
        ModelService,
        NotifyService,
        RestService,
        SwaggerTreeConverterService,
        DataService,
    ],
    imports: [
        AlertModule.forRoot(),
        BrowserModule,
        ModalModule.forRoot(),
        RouterModule.forRoot([]),
        SharedModule,
        Ng2BootstrapModule.forRoot(),
        NgxTreeSelectModule.forRoot({
            allowFilter: true,
            filterPlaceholder: 'Type your filter here...',
            maxVisibleItemCount: 5,
            idField: 'id',
            textField: 'name',
            childrenField: 'children',
            allowParentSelection: false
        })
    ],
    bootstrap: [
        AppComponent,
    ],
})
export class AppModule {

}
