import { Component, ElementRef, ViewChild } from '@angular/core';
import { IButtonProps, IButtonStyles } from 'office-ui-fabric-react/lib/Button';
import { FabricButtonStyles } from 'app/controls/fabric-button/fabric-button-styles'

@Component({
    selector: 'fabric-buttons-example',
    styleUrls: ['./fabric-buttons-example.component.scss'],
    templateUrl: './fabric-buttons-example.component.html'
})
export class FabricButtonsExampleComponent {
    public props: IButtonProps;

    public styles: IButtonStyles;
    public disabled: boolean;
    public text: string;
    public primary: boolean;
    public onClick: (e) => void;
    private _clickFuncChanged: boolean;

    public color: string;

    private _redColor: string;
    private _greenColor: string;

    public replacePropsOnToggle: boolean;

    @ViewChild('header') header: ElementRef;

    constructor() {
        this.styles = FabricButtonStyles.custom2;
        this.disabled = false;
        this.text = 'OFF';
        this.primary = true;
        this.onClick = (e) => { this._setColorRed(); };
        this._clickFuncChanged = false;

        this.color = 'default';

        this._redColor = 'red';
        this._greenColor = 'green';

        this.replacePropsOnToggle = false;

        this.props = {
            styles: this.styles,
            disabled: this.disabled,
            text: this.text,
            primary: this.primary,
            onClick: this.onClick
        };
    }
    
    public toggleDisabled() {
        this.disabled = !this.disabled;

        if (this.replacePropsOnToggle) {
            this._overWriteProps();
        } else {
            this._updateProps(true, false, false, false);
        }
    }

    public toggleText() {
        this.text = (this.text === 'OFF') ? 'ON'  : 'OFF';

        if (this.replacePropsOnToggle) {
            this._overWriteProps();
        } else {
            this._updateProps(false, true, false, false);
        }
    }

    public togglePrimary() {
        this.primary = !this.primary;

        if (this.replacePropsOnToggle) {
            this._overWriteProps();
        } else {
            this._updateProps(false, false, true, false);
        }
    }

    public toggleOnClick() {
        if (this._clickFuncChanged) {
            this.onClick = (e) => { this._setColorRed(); };
        } else {
            this.onClick = (e) => { this._setColorGreen(); };
        }
        this._clickFuncChanged = !this._clickFuncChanged;

        if (this.replacePropsOnToggle) {
            this._overWriteProps();
        } else {
            this._updateProps(false, false, false, true);
        }
    }

    private _setColorRed() {
        (this.header.nativeElement as HTMLElement).style.backgroundColor = this._redColor;
        this.color = this._redColor;
        this._redColor = this._redColor === 'red' ? 'darkred' : 'red';
        console.log((this.header.nativeElement as HTMLElement).tagName);
    }

    private _setColorGreen() {
        (this.header.nativeElement as HTMLElement).style.backgroundColor = this._greenColor;
        this.color = this._greenColor;
        this._greenColor = this._greenColor === 'green' ? 'greenyellow' : 'green';
        console.log((this.header.nativeElement as HTMLElement).tagName);
    }

    private _overWriteProps() {
        this.props = {
            styles: this.styles,
            disabled: this.disabled,
            text: this.text,
            primary: this.primary,
            onClick: this.onClick
        };
    }

    private _updateProps(updateDisabled: boolean, updateText: boolean, updatePrimary: boolean, updateOnClick: boolean) {
        if (this.props) {
            if (updateDisabled) {
                this.props.disabled = this.disabled;
            }
            if (updateText) {
                this.props.text = this.text;
            }
            if (updatePrimary) {
                this.props.primary = this.primary;
            }
            if (updateOnClick) {
                this.props.onClick = this.onClick;
            }
        }
    }
}
