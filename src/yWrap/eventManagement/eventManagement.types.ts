import {YWrappedValue} from "../conversionManagment/conversionManagement.types";
import {YMap} from "../conversionManagment/yjsEnhancement";

export enum YWrapEventName {
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
}

export type YPathEntry = string | number;
export type YPath = YPathEntry[];

export type YWrapCallback<Type = any> = (newValue: Type, oldValue: Type, isLocal: boolean, path: YPath) => boolean;

export type YWrapCallbackType = {
    type: YWrapEventName,
    callback: YWrapCallback
};

export type YCallbackCache = {
    boundNode: YMap,
    boundField: string,
    observers: object[]
}

export type YChange = {
    old: YWrappedValue,
    new: YWrappedValue
    local?: boolean
}

export type YChangeList = {
    add: Record<string, YChange>,
    update: Record<string, YChange>,
    delete: Record<string, YChange>
}