import {YValue} from "../yProxy/yProxy.types";
import {YProxy} from "../yProxy/yProxy";
import {YProxyFactory} from "./yProxyFactory";

export type YProxyConstructor<YType extends YValue = any, DataType = any> = new (
    data: DataType,
    key: string | number,
    parent: YProxy,
    factory: YProxyFactory
) => YType;

export type YProxyHandler<YType extends YValue = any, DataType = any> = {
    canHandle: (data: unknown, factory: YProxyFactory) => boolean;
    toYjs: (data: DataType, factory: YProxyFactory) => YType;
    constructor: YProxyConstructor<YType, DataType>;
}