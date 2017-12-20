import { IButtonStyles } from 'office-ui-fabric-react/lib/Button';

export class FabricButtonStyles {
    public static readonly default: IButtonStyles = {
        //Style for the root element in the default enabled, non-toggled state.
        root: {
            position: 'relative',
            fontFamily: '"Segoe UI Web (West European)", "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif',
            //-webkit-font-smoothing: 'antialiased',
            fontSize: '14px',
            fontWeight: '400',
            boxSizing: 'border-box',
            display: 'inline-block',
            textAlign: 'center',
            cursor: 'pointer',
            verticalAlign: 'top',
            paddingTop: '0px',
            paddingRight: '16px',
            paddingBottom: '0px',
            paddingLeft: '16px',
            minWidth: '80px',
            height: '32px',
            backgroundColor: 'rgb(0, 120, 215)',
            color: 'rgb(255, 255, 255)',
            userSelect: 'none',
            outline: 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'transparent',
            textDecoration: 'none',
            borderRadius: '0px'
        },
        //Style override for the root element in a checked state, layered on top of the root style.
        //rootChecked: {
        //},
        //Style override for the root element in a disabled state, layered on top of the root style.
        rootDisabled: {
            backgroundColor: 'rgb(244, 244, 244)',
            color: 'rgb(166, 166, 166)',
        },
        //Style override applied to the root on hover in the default, enabled, non-toggled state.
        rootHovered: {
            backgroundColor: 'rgb(16, 110, 190)',
            color: 'rgb(255, 255, 255)'
        },
        //Style override applied to the root on pressed in the default, enabled, non-toggled state.
        rootFocused: {

        },
        //Style override applied to the root on pressed in the default, enabled, non-toggled state.
        rootPressed: {
            backgroundColor: 'rgb(0, 90, 158)',
            color: 'rgb(255, 255, 255)'
        },
        // //Style override applied to the root on when menu is expanded in the default, enabled, non-toggled state.
        // rootExpanded: {
        // },
        // //Style override applied to the root on hover in a checked, enabled state
        // rootCheckedHovered: {
        // },
        // //Style override applied to the root on pressed in a checked, enabled state
        // rootCheckedPressed: {
        // },
        // //Style override applied to the root on hover in a checked, disabled state
        // rootCheckedDisabled: {
        // },
        // //Style override applied to the root on hover in a expanded state on hover
        // rootExpandedHovered: {
        // },
        //Style for the flexbox container within the root element.
        flexContainer: {
            display: 'flex',
            height: '100%',
            flexWrap: 'nowrap',
            justifyContent: 'center',
            alignItems: 'center'
        },
        //Style for the text container within the flexbox container element (and contains the text and description).
        textContainer: {
            flexGrow: '1'
        },
        //Style for the text content of the button.
        label: {
            marginTop: '0px',
            marginRight: '4px',
            marginBottom: '0px',
            marginLeft: '4px',
            lineHeight: '100%',
            fontWeight: '600'
        },
        //Style override for the text content when the button is disabled.
        labelDisabled: {

        },
        // //Style override for the text content when the button is checked.
        // labelChecked: {
        // },
        // //Style for the description text if applicable (for compound buttons.)
        // description: {
        // },
        // //Style override for the description text when the button is hovered.
        // descriptionHovered: {
        // },
        // //Style for the description text when the button is pressed.
        // descriptionPressed: {
        // },
        // //Style override for the description text when the button is disabled.
        // descriptionDisabled: {
        // },
        // //Style override for the description text when the button is checked.
        // descriptionChecked: {
        // },
        // //Style override for the screen reader text.
        // screenReaderText: {
        // }
    };

    public static readonly custom: IButtonStyles = {
        //Style for the root element in the default enabled, non-toggled state.
        root: {
            position: 'relative',
            fontFamily: 'inherit',
            //-webkit-font-smoothing: 'inherit',
            fontWeight: 'inherit',
            boxSizing: 'inherit',
            textAlign: 'initial',
            verticalAlign: 'initial',
            minWidth: 'inherit',
            height: 'initial',
            userSelect: 'initial',
            outline: 'transparent',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: 'transparent',
            textDecoration: 'initial',
            borderRadius: 'initial',

            marginLeft: '15px',
            display: 'inline',
            padding: '5px 45px 5px 45px',
            fontSize: '12px',
            cursor: 'pointer',
            backgroundImage: 'none',
            border: '1px solid transparent',
            color: '#fff',
            backgroundColor: '#0058ad'
        },
        //Style override for the root element in a checked state, layered on top of the root style.
        //rootChecked: {
        //},
        //Style override for the root element in a disabled state, layered on top of the root style.
        rootDisabled: {
            backgroundColor: 'rgba(127, 127, 127, 0.7)',
            cursor: 'disabled',
        },
        //Style override applied to the root on hover in the default, enabled, non-toggled state.
        rootHovered: {
            color: '#fff',
            backgroundColor: '#0072e0'
        },
        //Style override applied to the root on hover in the default, enabled, non-toggled state.
        rootFocused: {
            outline: '#00bcf2 dashed 1px'
        },
        //Style override applied to the root on pressed in the default, enabled, non-toggled state.
        rootPressed: {
            backgroundColor: '#003e7a'
        },
        // //Style override applied to the root on when menu is expanded in the default, enabled, non-toggled state.
        // rootExpanded: {
        // },
        // //Style override applied to the root on hover in a checked, enabled state
        // rootCheckedHovered: {
        // },
        // //Style override applied to the root on pressed in a checked, enabled state
        // rootCheckedPressed: {
        // },
        // //Style override applied to the root on hover in a checked, disabled state
        // rootCheckedDisabled: {
        // },
        // //Style override applied to the root on hover in a expanded state on hover
        // rootExpandedHovered: {
        // },
        //Style for the flexbox container within the root element.
        flexContainer: {
            display: 'inline-block',
            height: 'initial',
            flexWrap: 'initial',
            justifyContent: 'initial',
            alignItems: 'initial'
        },
        //Style for the text container within the flexbox container element (and contains the text and description).
        textContainer: {
            flexGrow: 'initial'
        },
        //Style for the text content of the button.
        label: {
            margin: '0px',
            lineHeight: 'initial',
            fontWeight: 'inherit'
        },
        //Style override for the text content when the button is disabled.
        labelDisabled: {

        },
        // //Style override for the text content when the button is checked.
        // labelChecked: {
        // },
        // //Style for the description text if applicable (for compound buttons.)
        // description: {
        // },
        // //Style override for the description text when the button is hovered.
        // descriptionHovered: {
        // },
        // //Style for the description text when the button is pressed.
        // descriptionPressed: {
        // },
        // //Style override for the description text when the button is disabled.
        // descriptionDisabled: {
        // },
        // //Style override for the description text when the button is checked.
        // descriptionChecked: {
        // },
        // //Style override for the screen reader text.
        // screenReaderText: {
        // }
    };

    public static readonly custom2: IButtonStyles = {
        //Style for the root element in the default enabled, non-toggled state.
        root: {
        },
        //Style override for the root element in a checked state, layered on top of the root style.
        //rootChecked: {
        //},
        //Style override for the root element in a disabled state, layered on top of the root style.
        rootDisabled: {
        },
        //Style override applied to the root on hover in the default, enabled, non-toggled state.
        rootHovered: {
        },
        //Style override applied to the root on hover in the default, enabled, non-toggled state.
        rootFocused: {
        },
        //Style override applied to the root on pressed in the default, enabled, non-toggled state.
        rootPressed: {
        },
        // //Style override applied to the root on when menu is expanded in the default, enabled, non-toggled state.
        // rootExpanded: {
        // },
        // //Style override applied to the root on hover in a checked, enabled state
        // rootCheckedHovered: {
        // },
        // //Style override applied to the root on pressed in a checked, enabled state
        // rootCheckedPressed: {
        // },
        // //Style override applied to the root on hover in a checked, disabled state
        // rootCheckedDisabled: {
        // },
        // //Style override applied to the root on hover in a expanded state on hover
        // rootExpandedHovered: {
        // },
        //Style for the flexbox container within the root element.
        flexContainer: {
        },
        //Style for the text container within the flexbox container element (and contains the text and description).
        textContainer: {
        },
        //Style for the text content of the button.
        label: {
        },
        //Style override for the text content when the button is disabled.
        labelDisabled: {
        },
        // //Style override for the text content when the button is checked.
        // labelChecked: {
        // },
        // //Style for the description text if applicable (for compound buttons.)
        // description: {
        // },
        // //Style override for the description text when the button is hovered.
        // descriptionHovered: {
        // },
        // //Style for the description text when the button is pressed.
        // descriptionPressed: {
        // },
        // //Style override for the description text when the button is disabled.
        // descriptionDisabled: {
        // },
        // //Style override for the description text when the button is checked.
        // descriptionChecked: {
        // },
        // //Style override for the screen reader text.
        // screenReaderText: {
        // }
    };
}