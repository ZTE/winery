import { Component, OnInit, ViewChild } from '@angular/core';

import { DataService } from '../../services/data/data.service';
import { BroadcastService } from '../../services/broadcast.service';
import { ModelService } from '../../services/model.service';
// import { SettingService } from '../../services/setting.service';
import { RestConfigComponent } from './rest-config/rest-config.component';

@Component({
  selector: 'menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {
  @ViewChild(RestConfigComponent) public restConfigComponent: RestConfigComponent;

  public canSave = true;
  public showBack = false;

  constructor(private dataService: DataService, private modelService: ModelService,
    private broadcastService: BroadcastService) { }

  ngOnInit() {
    this.broadcastService.planEditable$.subscribe(planEditable => this.canSave = planEditable);
    this.showBack = 'Catalog' === this.dataService.getBackendType();
    // this.settingService.getSetting().subscribe(setting => {
    //   this.showBack = 'Catalog' === setting.BackendType;
    // })
  }

  public save(): void {
    this.modelService.save();
  }

  public showRestConfigModal(): void {
    this.restConfigComponent.show();
  }

  public back(): void {
    const addressUrl = location.search.slice(1);
    const searchParams = new URLSearchParams(addressUrl);
    const bpId = searchParams.get('serviceTemplateId');
    location.href = '/blueprint/#/main/blueprint;operation=design;blueprintId=' + bpId;
  }

  public test() {
    const params = this.modelService.getPlanParameters('node1');
    console.log(params);
  }
}
