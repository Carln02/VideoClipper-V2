import {YMap} from "./yjsEnhancement";
import {YWrappedObject} from "../yWrapper/yWrapper.types";

export type YPrimitive = string | boolean | number;

export type YValue<Type = any> = YMap<Type> | YPrimitive;

export type YWrappedValue<Type = object> = YWrappedObject<Type> | YPrimitive;