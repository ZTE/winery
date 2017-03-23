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
import {Subject} from "rxjs/Subject";

@Injectable()
export class BroadcastService {

    public jsPlumbInstance = new Subject<any>();
	public jsPlumbInstance$ = this.jsPlumbInstance.asObservable();

	public showProperty = new Subject<any>();
	public showProperty$ = this.showProperty.asObservable();

	public planModel = new Subject<any>();
	public planModel$ = this.planModel.asObservable();

	public saveEvent = new Subject<any>();
	public saveEvent$ = this.saveEvent.asObservable();

	public nodeProperty = new Subject<any>();
	public nodeProperty$ = this.nodeProperty.asObservable();

	public nodeTemplates = new Subject<any>();
	public nodeTemplates$ = this.nodeTemplates.asObservable();

	public nodeInterfaces = new Subject<any>();
	public nodeInterfaces$ = this.nodeInterfaces.asObservable();

	public nodeOperations = new Subject<any>();
	public nodeOperations$ = this.nodeOperations.asObservable();

	public nodeParameters = new Subject<any>();
	public nodeParameters$ = this.nodeParameters.asObservable();

	/**
	 * broadcast datas
	 * this method will catch the exceptions for
	 * @param sub
	 * @param data
	 */
	public broadcast(sub: any, data: any) {
		try {
			sub.next(data);
		} catch (err) {
			console.error(err);
		}
	}
}
