import { Component, OnInit, ViewChild } from '@angular/core';

import { DataService } from '../../services/data/data.service';
import { ModelService } from '../../services/model.service';
import { WmRestConfigComponent } from './rest-config/rest-config.component';

@Component({
  selector: 'menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.css']
})
export class MenusComponent implements OnInit {
  @ViewChild(WmRestConfigComponent) public restConfigComponent: WmRestConfigComponent;

  constructor(private dataService: DataService, private modelService: ModelService) { }

  ngOnInit() {
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
