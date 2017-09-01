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

import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * main component
 */
@Component({
    selector: 'workflow',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    constructor(translate: TranslateService) {
        // Init the I18n function.
        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('en');
        // the lang to use, if the lang isn't available, it will use the current loader to get them
        const topWin: any = window.top;
        let browserLang = '';
        if (topWin.getLanguage && typeof topWin.getLanguage == 'function') {
            browserLang = topWin.getLanguage() || '';
        } else {
            browserLang = translate.getBrowserCultureLang() || '';
        }
        translate.use(browserLang);
    }
}
