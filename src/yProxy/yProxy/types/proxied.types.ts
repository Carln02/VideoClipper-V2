import {YProxy} from "../yProxy";
import {YProxyFactory} from "../../yProxyFactory/yProxyFactory";
import {YMapProxy} from "../../yProxyBaseTypes/yMapProxy";
import {PartialRecord} from "turbodombuilder";
import {YProxyEventName, YCallback} from "./events.types";
import {YProxyCallbackHandler} from "../handlers/yProxyCallbackHandler";
import {YProxyCacheHandler} from "../handlers/yProxyCacheHandler";
import {YProxyChangeHandler} from "../handlers/yProxyChangeHandler";
import {YDoc, YValue} from "./base.types";

export function proxied<Type>(data: Type): YProxied<Type> {
    return data as YProxied<Type>;
}

export type YProxied<Type = object> = Type & {
    readonly key: string | number,
    readonly parent: YProxy,
    readonly factory: YProxyFactory,

    readonly callbackHandler: YProxyCallbackHandler,
    readonly cacheHandler: YProxyCacheHandler,
    readonly changeHandler: YProxyChangeHandler<Type>,

    get id(): string,
    get index(): number,
    get value(): Type,
    get boundObjects(): object[],

    toJSON(): Type,
    getByKey(key: string | number): unknown,
    setByKey(key: string | number, yValue: YValue): boolean,
    deleteByKey(key: string | number): boolean,
    hasByKey(key: string | number): boolean,
    getYjsKeys(): string[],

    getRoot(): YMapProxy,
    getDoc(): YDoc,
    getPath(): (string | number)[],
    getProxyByKey(key: string | number): YProxy,

    bind(eventType: YProxyEventName, callback: YCallback, context?: object, executeOnBind?: boolean): void,
    bindAtKey(key: string | number, eventType: YProxyEventName, handler: YCallback, context?: object,
              executeOnBind?: boolean): void,
    bindObject(object: object): void,

    unbindCallback(eventType: YProxyEventName, callback: YCallback): void,
    unbindObject(context: object): void,
    unbindObjectDeep(context: object): void,

    getBoundObjectOfType<Type extends object>(type: new (...args: unknown[]) => Type): Type,
    getBoundObjectsOfType<Type extends object>(type: new (...args: unknown[]) => Type): Type[],

    destroyBoundObjects(): void,

    getFromLocalPath(path: Array<string | number>): YProxy,
    getFromAbsolutePath(path: Array<string | number>): YProxy,

    clearCache(): void,

    valueOf(): Type,
    toString(): string
};

export type YNumber = YProxied<number>;
export type YBoolean = YProxied<boolean>;
export type YString = YProxied<string>;

export type YRecord<A extends string | number | symbol, B> = YProxied<Record<A, B>>;
export type YPartialRecord<A extends string | number | symbol, B> = YProxied<PartialRecord<A, B>>;

export type YCoordinate = YProxied<{ x: YNumber, y: YNumber }>;

export type YProxiedArray<YType = YProxied, DataType = unknown> = YProxied<Array<YType>> & {
    push(...entries: (YType | DataType)[]): number;
    unshift(...entries: (YType | DataType)[]): number;
    splice(index: number, deleteCount: number, ...entries: (YType | DataType)[]): number;
    insert(index: number, ...entries: (YType | DataType)[]): number;
    indexOf(entry: YType | DataType): number;
};