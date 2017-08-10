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

import { AfterViewInit, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * property component presents information of a workflow node.
 * the presented information can be edit in this component.
 * it may load information dynamically. the content may be different for different node type.
 */
@Component({
    selector: 'b4t-editable-property',
    templateUrl: 'editable-property.component.html',
})
export class WmEditablePropertyComponent {
    @Input() public propertyValue: any;
    @Output() public propertyValueChange = new EventEmitter<any>();

    private editing = false;

    public isEditing(): boolean {
        return this.editing;
    }

    public startEdit() {
        this.editing = true;
    }

    public completeEdit() {
        this.editing = false;
        this.propertyValueChange.emit(this.propertyValue);
    }
}