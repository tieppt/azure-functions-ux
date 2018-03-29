import { Component, Input, Injector } from '@angular/core';
import { ComponentNames } from '../../shared/models/constants';
import { FeatureComponent } from '../../shared/components/feature-component';
import { FunctionMonitorInfo } from '../../shared/models/function-monitor';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: ComponentNames.monitorApplicationInsights,
  templateUrl: './monitor-applicationinsights.component.html',
  styleUrls: ['./monitor-applicationinsights.component.scss']
})
export class MonitorApplicationInsightsComponent extends FeatureComponent<FunctionMonitorInfo> {

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
      .switchMap(functionMonitorInfo => {
        return Observable.of(functionMonitorInfo);
      })
      .do(x => {
        console.log(x);
      });
  }

}
