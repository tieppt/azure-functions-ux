import { FunctionAppService } from 'app/shared/services/function-app.service';
import { FunctionAppContext } from './../function-app-context';
import { EditModeHelper } from './../Utilities/edit-mode.helper';
import { Directive, Input, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/switchMap';


@Directive({
    selector: '[fnWriteAccess]',
})
export class FnWriteAccessDirective {

    functionAppContextStream: Subject<FunctionAppContext>;

    @Input('fnWriteAccess') set functionAppContext(value) {
        this.functionAppContextStream.next(value);
    }

    constructor(private elementRef: ElementRef, private functionAppService: FunctionAppService) {
        this.functionAppContextStream = new Subject<FunctionAppContext>();

        this.functionAppContextStream
            .filter(c => !!c)
            .switchMap(c => this.functionAppService.getFunctionAppEditMode(c))
            .map(result => result.isSuccessful ? EditModeHelper.isReadOnly(result.result) : false)
            .subscribe(isReadOnly => {
                if (isReadOnly) {
                    this.elementRef.nativeElement.style.pointerEvents = 'none';
                    this.elementRef.nativeElement.disabled = true;
                    this.elementRef.nativeElement.style.opacity = '0.2';
                }
            });
    }
}
