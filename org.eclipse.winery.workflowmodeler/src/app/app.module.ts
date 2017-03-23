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
import { NgModule }      from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { WmContainerComponent } from "./components/container/container.component";
import { WmNodeComponent } from "./components/node/node.component";
import { WmNodeTemplateComponent } from "./components/nodetemplate/nodetemplate.component";
import { WmParameterComponent } from "./components/parameter/parameter.component";
import { WmPropertiesComponent } from "./components/property/properties.component";
import { WmToolbarComponent } from "./components/toolbar/toolbar.component";

import { BroadcastService } from "./services/broadcast.service";
import { JsPlumbService } from "./services/jsplumb.service";
import { ModelService } from "./services/model.service";
import { WineryService } from "./services/winery.service";

import { SharedModule } from "./shared/shared.module";

@NgModule({
	declarations: [
		AppComponent,
		WmToolbarComponent,
		WmContainerComponent,
		WmNodeComponent,
		WmPropertiesComponent,
		WmParameterComponent,
		WmNodeTemplateComponent,
	],
	providers: [
		BroadcastService,
		WineryService,
		JsPlumbService,
		ModelService,
	],
	imports: [
		BrowserModule,
		NgbModule.forRoot(),
		RouterModule.forRoot([]),
		AppRoutingModule,
		SharedModule,
	],
	bootstrap: [
		AppComponent,
	],
})
export class AppModule {
}
