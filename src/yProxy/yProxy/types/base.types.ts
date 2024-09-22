import {Map as YMap, Array as YArray, AbstractType as YAbstractType, Text as YText, Doc as YDoc} from "yjs";

export type YValue = YAbstractType | YPrimitive;

export type YPrimitive = string | number | boolean | undefined;

export type YPathEntry = string | number;
export type YPath = YPathEntry[];

export type YProxyChanged = {
    selfChanged?: boolean,
    entryChanged?: boolean,
    subTreeChanged?: boolean
};

export {YMap, YArray, YAbstractType, YText, YDoc};