import {YMap, YArray, YAbstractType} from "./yjsEnhancement";
import {YWrappedObject} from "../yWrapper/yWrapper.types";

export type Constructor<Type> = new (...args: any[]) => Type;

export type YPrimitive = string | boolean | number | String | Boolean | Number;

export type YSharedType = YAbstractType | YMap | YArray;

export type YValue<Type = any> = YMap<Type> | YPrimitive;

export type YValueNew = YSharedType | YPrimitive;

export type YWrappedValue<Type = object> = YWrappedObject<Type> | YPrimitive;