import { Component, Input, Injector } from '@angular/core';
import { ComponentNames } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { FunctionMonitorInfo } from '../../shared/models/function-monitor';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: ComponentNames.monitorClassic,
  templateUrl: './monitor-classic.component.html',
  styleUrls: ['./monitor-classic.component.scss']
})
export class MonitorClassicComponent extends FeatureComponent<FunctionMonitorInfo> {
  @Input() set functionMonitorInfoInput(functionMonitorInfo: FunctionMonitorInfo) {
      this.setBusy();
      this.setInput(functionMonitorInfo);
  }

  constructor(injector: Injector) {
    super(ComponentNames.monitorApplicationInsights, injector, 'dashboard');
    this.featureName = ComponentNames.functionMonitor;
  }

  protected setup(functionMonitorInfoInputEvent: Observable<FunctionMonitorInfo>) {
    return functionMonitorInfoInputEvent
        .do(functionMonitorInfo => {
            this.clearBusy();
        });
  }

}
