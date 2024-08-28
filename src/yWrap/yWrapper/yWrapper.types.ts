import {YMap} from "../conversionManagment/yjsEnhancement";
import {YPath, YWrapCallbackType} from "../eventManagement/eventManagement.types";
import {YPrimitive} from "../conversionManagment/conversionManagement.types";

export type YWrappedInfo = {
    yMap: YMap,
    rawObject: any,
    parent: YMap | null,
    observers: any[],
    callbacks: YWrapCallbackType[],
    batchTimer: NodeJS.Timeout | null
};

export type YWrappedObject<Type = object> = Type & {
    get_observable(): boolean;
    set_observable(): void;
    get_observers(): object[];
    observe(object: object): void;
    unobserve(object: object): void;
    forward_callbacks(object: object): void;
    destroy_observers(): void;
    get_closest_observable_parent(path?: YPath): YWrappedObject | undefined;
    has_parent(): boolean;
    get_parent(): YWrappedObject | undefined;
    unwrap(): YWrappedInfo;
    toJSON(): Type;
    get_key(): YPrimitive;
    reindex(): void;
};

export enum ReservedKeys {
    subDoc = "__yWrap__subDoc",
    array = "__yWrap__array",
    observable = "__yWrap__observable",
    dataType = "__yWrap__dataType",
    nodeName = "__yWrap__nodeName",
}