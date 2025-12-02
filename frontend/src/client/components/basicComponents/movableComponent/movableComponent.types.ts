import {TurboElementProperties} from "turbodombuilder";

export type MovableComponentProperties<Type extends Element> = TurboElementProperties & {
    clone?: Type,
    originElement?: Type
};