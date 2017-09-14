import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { HttpService } from '../util/http.service';

@Injectable()
export class SettingService {

  constructor(private http: HttpService) { }

  public getSetting(): Observable<any> {
    return this.http.get('assets/global-setting.json');
  }

}
