import {
    Open,
    PartialRecord, Reifect,
    Side,
    TurboCustomProperties, TurboIconSwitch, TurboIconSwitchProperties,
    TurboModel,
    TurboProperties,
    TurboView
} from "turbodombuilder";

type TurboDrawerProperties<
    ViewType extends TurboView = TurboView,
    DataType extends object = object,
    ModelType extends TurboModel = TurboModel,
> = TurboCustomProperties<ViewType, DataType, ModelType> & {
    side?: Side,
    offset?: PartialRecord<Open, number>
    hideOverflow?: boolean,

    panel?: TurboProperties | HTMLElement,
    thumb?: TurboProperties | HTMLElement,

    icon?: string | Element | TurboIconSwitchProperties<Side> | TurboIconSwitch<Side>;
    attachSideToIconName?: boolean;
    rotateIconBasedOnSide?: boolean;

    initiallyOpen?: boolean,
    transition?: Reifect<HTMLElement>
}

export {TurboDrawerProperties};