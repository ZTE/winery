import { Component, OnInit, ViewChild } from '@angular/core';

import { DataService } from '../../services/data/data.service';
import { BroadcastService } from '../../services/broadcast.service';
import { ModelService } from '../../services/model.service';
import { WmRestConfigComponent } from './rest-config/rest-config.component';

@Component({
  selector: 'menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {
  @ViewChild(WmRestConfigComponent) public restConfigComponent: WmRestConfigComponent;

  public canSave = true;

  constructor(private dataService: DataService, 
    private modelService: ModelService,
    private broadcastService: BroadcastService) { }

  ngOnInit() {
    this.broadcastService.planEditable$.subscribe(planEditable => this.canSave = planEditable);
  }

  public save(): void {
    this.modelService.save();
  }

  public showRestConfigModal(): void {
    this.restConfigComponent.show();
  }

  public back(): void { }


  public test() {
    const params = this.modelService.getPlanParameters('node1');
    console.log(params);
  }
}
