import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import { ModalDirective } from 'ngx-bootstrap/modal';

import { Parameter } from '../../../model/workflow/parameter';
import { ApdsUtil } from '../../../util/apds-util';

@Component({
  selector: 'b4t-custom-parameter',
  templateUrl: './custom-parameter.component.html',
  styleUrls: ['./custom-parameter.component.css'],
})
export class CustomParameterComponent implements OnInit {
  @ViewChild('customParameterModal') public customParameterModal: ModalDirective;
  @Output() updateParams: EventEmitter<Parameter[]> = new EventEmitter();
  public parameters: Parameter[] = [];
  public paramTypes: string[] = ['string'];

  constructor() { }

  public ngOnInit() { }

  public create(): void {
    const newParam = new Parameter();
    newParam.type = this.paramTypes[0];
    this.parameters.push(newParam);
  }

  public isEmpty(name: string): boolean {
    if (name && '' !== name) {
      return false;
    } else {
      return true;
    }
  }

  public hasSame(parameter: Parameter): boolean {
    for (const param of this.parameters) {
      if (param !== parameter && param.name === parameter.name) {
        return true;
      }
    }
    return false;
  }

  public delete(index: number): void {
    this.parameters.splice(index, 1);
  }

  public ok(): void {
    this.updateParams.emit(this.parameters);
    this.customParameterModal.hide();
  }

  public close(): void {
    this.customParameterModal.hide();
  }

  public show(parameters: Parameter[]): void {
    if (parameters) {
      this.parameters = ApdsUtil.DeepClone(parameters);
    } else {
      this.parameters = [];
    }
    this.customParameterModal.show();
  }
}
