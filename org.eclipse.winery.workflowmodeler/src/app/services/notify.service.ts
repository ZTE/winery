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
import * as PNotify from 'pnotify/dist/pnotify';

/**
 * NotifyService
 * display notify infos.
 */
@Injectable()
export class NotifyService {

    constructor() {
        PNotify.prototype.options.styling = "fontawesome";
    }

    public success(text: string) {
        this.showNotify('success', text);
    }

    public info(text: string) {
        this.showNotify('info', text);
    }

    public warn(text: string) {
        this.showNotify('notice', text);
    }

    public error(text: string) {
        this.notify({
            type: 'error',
            title: 'error',
            text,
            hide: false,
            buttons: {
                closer: true,
                closer_hover: false,
                sticker: true,
                sticker_hover: false,
            },
        });
    }

    /**
     * notify
     * @param options notify info by custom options
     */
    public notify(options: any) {
        new PNotify(options);
    }

    /**
     * showNotify
     * use default notify options
     * @param type
     * @param text
     */
    private showNotify(type: string, text: string) {
        this.notify({
            type,
            delay: 3000,
            title: type,
            text,
            hide: true,
            buttons: {
                closer: true,
                sticker: true,
            },
        });
    }
}
