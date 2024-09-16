import {YAbstractType} from "../conversionManagment/yjsEnhancement";
import {YProxy} from "./yProxy";

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

export type YWrapCallbackType = {
    callback: YWrapCallback,
    context?: object
};