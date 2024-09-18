import {YAbstractType} from "../conversionManagment/yjsEnhancement";
import {YProxy} from "./yProxy";
import {YProxyFactory} from "../yProxyFactory/yProxyFactory";
import {YMapProxy} from "./types/yMapProxy";
import {PartialRecord} from "turbodombuilder";

export enum YProxyEventName {
    initialized = "initialized",

    added = "added",
    updated = "updated",
    deleted = "deleted",
    changed = "changed",

    entryAdded = "entryAdded",
    entryUpdated = "entryUpdated",
    entryDeleted = "entryDeleted",
    entryChanged = "entryChanged",

    subTreeAdded = "subTreeAdded",
    subTreeUpdated = "subTreeUpdated",
    subTreeDeleted = "subTreeDeleted",
    subTreeChanged = "subTreeChanged",

    selfOrSubTreeAdded = "selfOrSubTreeAdded",
    selfOrSubTreeUpdated = "selfOrSubTreeUpdated",
    selfOrSubTreeDeleted = "selfOrSubTreeDeleted",
    selfOrSubTreeChanged = "selfOrSubTreeChanged",
}

export type YRawEventType = YProxyEventName.added | YProxyEventName.deleted | YProxyEventName.updated;

export type YEventTypes = {
    event: YProxyEventName,
    selfOrSubTreeEvent: YProxyEventName,
    entryEvent: YProxyEventName,
    subTreeEvent: YProxyEventName
}

export type YValue = YAbstractType | YPrimitive;

export type YPrimitive = string | number | boolean | undefined;

export type YPathEntry = string | number;
export type YPath = YPathEntry[];

export type YWrapCallback<Type = unknown> = (newValue: Type, oldValue: Type, isLocal: boolean, path: YPath, self: YProxy) => void;

export type YWrapCallbackData = {
    callback: YWrapCallback,
    context?: object
};

export type YProxied<Type = object> = Type & {
    key: string | number,
    parent: YProxy,
    factory: YProxyFactory,

    changesThrottlingTime: 200,

    id: string,
    index: number,
    value: Type,
    boundObjects(): object[],

    getRoot(): YMapProxy,
    getPath(): (string | number)[],

    bind(eventType: YProxyEventName, callback: YWrapCallback, context?: object, executeOnBind?: boolean): void,
    unbindCallback(eventType: YProxyEventName, callback: YWrapCallback): void,
    unbindObject(context: object): void,

    getFromLocalPath(path: Array<string | number>): YProxy,
    getFromAbsolutePath(path: Array<string | number>): YProxy,

    getBoundObjectOfType<Type extends object>(type: new (...args: unknown[]) => Type): Type,
    getBoundObjectsOfType<Type extends object>(type: new (...args: unknown[]) => Type): Type[],

    destroyBoundObjects(): void,
    clearCache(): void,

    generateProxy(): YProxied<Type>,

    toString(): string
};

export type YNumber = YProxied<number>;
export type YBoolean = YProxied<boolean>;
export type YString = YProxied<string>;

export type YRecord<A extends string | number | symbol, B> = YProxied<Record<A, B>>;
export type YPartialRecord<A extends string | number | symbol, B> = YProxied<PartialRecord<A, B>>;

export type YCoordinate = YProxied<{x: YNumber, y: YNumber}>;

export type YProxiedArray<Type = any> = YProxied<Array<Type>>;

export function proxied<Type>(data: Type): YProxied<Type> {
    return data as YProxied<Type>;
}