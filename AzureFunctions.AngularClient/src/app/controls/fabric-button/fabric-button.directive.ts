import * as React from 'react';
import * as ReactDOM from 'react-dom';
//import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import { DefaultButton, IButtonProps, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { AfterViewInit, Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
//import { FabricButtonStyles } from './fabric-button-styles';

@Directive({
  selector: '[fabric-button]'
})
export class FabricButtonDirective implements AfterViewInit, OnChanges, OnDestroy {
  @Input() props: IButtonProps;

  @Input('props.styles') styles: IButtonStyles;
  @Input('props.disabled') disabled: boolean;
  @Input('props.text') text: string;
  @Input('props.primary') primary: boolean;
  @Input('props.onClick') onClick: (any) => void;

  constructor(private _elementRef: ElementRef) {
    //this.props = {
    //  styles: FabricButtonStyles.custom
    //}
  }

  public ngAfterViewInit() {
    this.props.className = 'foo';

    this._render();
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (!this.props) {
      this.props = {};
    }

    if (changes['props']) {
      // Ignore any other changes in 'props.*' inputs?
    }

    if (changes['styles']) {
      this.props.styles = this.styles;
    }

    if (changes['disabled']) {
      this.props.disabled = this.disabled;
    }

    if (changes['text']) {
      this.props.text = this.text;
    }

    if (changes['primary']) {
      this.props.primary = this.primary;
    }

    if (changes['onClick']) {
      this.props.onClick = this.onClick;
    }

    this.props.className = 'foo';

    this._render();
  }

  public ngOnDestroy() {
    ReactDOM.unmountComponentAtNode(this._elementRef.nativeElement as HTMLElement);
  }

  private _render() {
    const buttonElement = React.createElement(DefaultButton, this.props, null);
    //const fabricElement = React.createElement(Fabric, null, buttonElement);
    //ReactDOM.render(fabricElement, this._elementRef.nativeElement as HTMLElement);
    ReactDOM.render(buttonElement, this._elementRef.nativeElement as HTMLElement);
  }

}