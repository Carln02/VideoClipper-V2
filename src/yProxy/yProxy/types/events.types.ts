import {YProxy} from "../yProxy";
import {YPath} from "./base.types";

export enum YProxyEventName {
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

export type YCallback<Type = unknown> = (newValue: Type, oldValue: Type, isLocal: boolean, path: YPath, self: YProxy) => void;

export type YCallbackData = {
    callback: YCallback,
    context?: object
};