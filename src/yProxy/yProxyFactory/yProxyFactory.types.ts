import {YProxy} from "../yProxy/yProxy";
import {YProxyFactory} from "./yProxyFactory";
import {YValue} from "../yProxy/types/base.types";

export type YProxyConstructor<YType extends YValue = any, DataType = unknown> = new (
    data: DataType,
    key: string | number,
    parent: YProxy,
    factory: YProxyFactory
) => YType;

export type YProxyHandler<YType extends YValue = any, DataType = unknown> = {
    canHandle: (data: unknown, factory: YProxyFactory) => boolean;
    toYjs: (data: DataType, key: string | number, parent: YProxy, factory: YProxyFactory) => YType;
    constructor: YProxyConstructor<YType, DataType>;
}