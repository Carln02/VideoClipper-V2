import {YProxyFactory} from "../yProxyFactory/yProxyFactory";
import {YProxyCallbackHandler} from "./handlers/yProxyCallbackHandler";
import {YProxyCacheHandler} from "./handlers/yProxyCacheHandler";
import {YProxyChangeHandler} from "./handlers/yProxyChangeHandler";
import {YMapProxy} from "../yProxyBaseTypes/yMapProxy";
import {YArray, YDoc, YPath, YProxyChanged, YValue} from "./types/base.types";
import {YProxyEventName, YCallback} from "./types/events.types";

export abstract class YProxy<YType extends YValue = YValue, DataType = unknown> {
    private readonly proxy: this & DataType;

    public yData: YType;

    public readonly factory: YProxyFactory;

    public readonly key: string | number;
    public readonly parent: YProxy;

    public static changesThrottlingTime: number = 500;

    public readonly callbackHandler: YProxyCallbackHandler;
    public readonly cacheHandler: YProxyCacheHandler;
    public readonly changeHandler: YProxyChangeHandler<DataType>;

    public constructor(data: YType, key: string | number, parent: YProxy, factory: YProxyFactory) {
        this.proxy = this.generateProxy();

        this.yData = data;

        this.factory = factory;

        this.key = key;
        this.parent = parent;

        this.callbackHandler = new YProxyCallbackHandler(this.proxy);
        this.cacheHandler = new YProxyCacheHandler(this.proxy);
        this.changeHandler = new YProxyChangeHandler(this.proxy);

        this.setupBasicListeners();
    }

    //Getters

    public get id(): string {
        return this.key?.toString();
    }

    public get index(): number {
        return typeof this.key == "number" ? this.key : Number.parseInt(this.key);
    }

    public get value(): DataType {
        return this.changeHandler.getProxyValue();
    }

    public get boundObjects(): object[] {
        return this.callbackHandler.boundObjects;
    }

    //To be overridden

    protected abstract diffChanges(newValue: DataType, toBeDeleted?: boolean, oldValue?: DataType): YProxyChanged;

    public abstract toJSON(): DataType;

    public abstract getByKey(key: string | number): unknown;

    public abstract setByKey(key: string | number, yValue: YValue): boolean;

    public abstract deleteByKey(key: string | number): boolean;

    public abstract hasByKey(key: string | number): boolean;

    public abstract getYjsKeys(): (string | number)[];

    //Public utilities

    public getProxy(): this & DataType {
        return this.proxy;
    }

    public getRoot(): YMapProxy {
        let current: YProxy = this.proxy;
        while (current.parent != null) current = current.parent;
        return current as YMapProxy;
    }

    public getDoc(): YDoc {
        return this.getRoot().yData.doc;
    }

    public getPath(): (string | number)[] {
        const path = [];
        let parent: YProxy = this.proxy;
        while (parent != null) {
            if (parent.key != null) path.push(parent.key);
            parent = parent.parent;
        }
        return path.reverse();
    }

    public getProxyByKey(key: string | number): YProxy {
        return this.cacheHandler.getCachedProxy(key);
    }

    public getAllChildren(): YProxy[] {
        const proxies = [];
        for (const key of this.getYjsKeys()) proxies.push(this.getProxyByKey(key));
        return proxies;
    }

    public bind(eventType: YProxyEventName, callback: YCallback, context?: object, executeOnBind: boolean = true) {
        this.callbackHandler.bind(eventType, callback, context, executeOnBind);
    }

    public bindAtKey(key: string | number, eventType: YProxyEventName, handler: YCallback, context?: object,
                     executeOnBind: boolean = true) {
        const tempCallback = (_newValue: unknown, _oldValue: unknown, _isLocal: boolean, path: YPath) => {
            if (path[path.length - 1].toString() !== key.toString()) return;
            this.getProxyByKey(key).bind(eventType, handler, context, executeOnBind);
            this.unbindCallback(YProxyEventName.entryAdded, tempCallback);
        };

        this.bind(YProxyEventName.entryAdded, tempCallback, this);
    }

    public bindObject(object: object) {
        this.callbackHandler.bindObject(object);
    }

    public unbindCallback(eventType: YProxyEventName, callback: YCallback) {
        this.callbackHandler.unbindCallback(eventType, callback);
    }

    public unbindObject(object: object) {
        this.callbackHandler.unbindObject(object);
    }

    public unbindObjectDeep(object: object) {
        this.callbackHandler.unbindObject(object);
        this.proxy.getYjsKeys().forEach(key => this.proxy.getProxyByKey(key).unbindObjectDeep(object));
    }

    public getBoundObjectOfType<Type extends object>(type: new (...args: unknown[]) => Type): Type {
        return this.boundObjects.find(entry => entry instanceof type) as Type;
    }

    public getBoundObjectsOfType<Type extends object>(type: new (...args: unknown[]) => Type): Type[] {
        return this.boundObjects.filter(entry => entry instanceof type) as Type[];
    }

    public destroyBoundObjects() {
        this.boundObjects.forEach(entry => {
            if ("destroy" in entry && typeof entry.destroy == "function") entry.destroy();
        });
    }

    public getFromLocalPath(path: Array<string | number>): YProxy {
        return this.getFromPath(path, this);
    }

    public getFromAbsolutePath(path: Array<string | number>): YProxy {
        return this.getFromPath(path, this.getRoot());
    }

    public clearCache() {
        this.cacheHandler.clearCache();
    }

    public toString(): string {
        return this.value.toString();
    }

    public valueOf(): DataType {
        return this.value;
    }

    //Proxy generation method

    protected generateProxy(): this & DataType {
        return new Proxy(this, {
            get: (target: YProxy<YType, DataType>, prop: string | symbol) => {
                if (prop === Symbol.toPrimitive) return (hint: string) => target[Symbol.toPrimitive](hint);
                if (target.isInPrototype(prop)) return target[prop];

                const proxy = target?.getProxyByKey(prop.toString());
                if (proxy) return proxy;

                return target.customProxyGetter(prop);
            },
            set: (target: YProxy<YType, DataType>, prop: string | symbol, value) => {
                const key = prop.toString();
                if (target.isInPrototype(prop)) {
                    if (typeof target[prop] == "function") throw new Error("Unable to set prototype method.");
                    target[prop] = value;
                    return true;
                }

                if (typeof target.yData != "object") return true;

                const child = target.getProxyByKey(key);
                const doc = target.getDoc();

                if (child) {
                    if (doc) doc.transact(() => child.diffChanges(value, false, child.value));
                    else child.diffChanges(value, false, child.value);
                } else {
                    if (doc) doc.transact(() => target.factory.toYjs(value, key, target));
                    else target.factory.toYjs(value, key, target);
                    const proxy = target.getProxyByKey(key);
                    proxy.callbackHandler.dispatchCallbacks(YProxyEventName.added, undefined, true);
                }

                return true;
            },
            deleteProperty: (target: YProxy<YType, DataType>, prop: string) => {
                if (target.isInPrototype(prop)) return false;
                if (typeof target.yData != "object") return target.deleteByKey(undefined);

                const child = target.getProxyByKey(prop);
                if (child) child.diffChanges(undefined, true);
                return true;
            },
            has: (target: YProxy<YType, DataType>, prop: string) => target.isInPrototype(prop) || target.hasByKey(prop),
            ownKeys: (target: YProxy<YType, DataType>) => target.getYjsKeys().map(key => key.toString()),
            getOwnPropertyDescriptor: (target: YProxy<YType, DataType>, prop: string | symbol) => {
                if (target.isInPrototype(prop)) return Object.getOwnPropertyDescriptor(target, prop) || undefined;

                if (target.hasByKey(prop.toString())) return {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: target.getProxyByKey(prop.toString())
                };

                return undefined;
            },
        }) as this & DataType;
    }

    protected customProxyGetter(prop: string | symbol): unknown {
        return this.yData[prop];
    }

    //Built-in utilities overrides

    public forEach(callback: (entry: YProxy, key: string | number, self: this) => boolean | void): void {
        for (const key of this.getYjsKeys()) {
            if (callback(this.getProxyByKey(key), key, this) === false) break;
        }
    }

    public traverse(callback: (entry: YProxy, key: string | number, self: this) => void): void {
        this.forEach((entry, key, self) => {
            callback(entry, key, self);
            entry.traverse(callback);
        });
    }

    public filter(callback: (entry: YProxy, key: string | number, self: this) => boolean): YProxy[] {
        const result = [];
        this.forEach((entry, key, self) => {
            if (callback(entry, key, self)) {
                result.push(entry);
            }
        });
        return result;
    }

    public map<ResultType>(callback: (entry: YProxy, key: string | number, self: this) => ResultType): ResultType[] {
        const results: ResultType[] = [];
        this.forEach((entry, key, self) => {
            results.push(callback(entry, key, self));
        });
        return results;
    }

    public reduce<ResultType>(callback: (accumulator: ResultType, entry: YProxy, key: string | number, self: this) =>
        ResultType, initialValue: ResultType): ResultType {
        let accumulator = initialValue;
        this.forEach((entry, key, self) => {
            accumulator = callback(accumulator, entry, key, self);
        });
        return accumulator;
    }

    public flatMap<ResultType>(callback: (value: YProxy, key: string | number, array: this) =>
        ResultType | ResultType[] | YProxy<YArray, ResultType[]>): ResultType[] {
        const results: ResultType[] = [];

        this.forEach((entry, key, self) => {
            const result = callback(entry, key, self);

            if (result instanceof YProxy && result.yData instanceof YArray) results.push(...result.getAllChildren() as ResultType[]);
            else if (Array.isArray(result)) results.push(...result);
            else results.push(result as ResultType);
        });

        return results;
    }

    //Private utilities

    private isInPrototype(prop: string | symbol) {
        return Object.prototype.hasOwnProperty.call(this, prop)
            || Object.prototype.hasOwnProperty.call(YProxy.prototype, prop)
            || (prop in this && typeof this[prop] == "function");
    }

    private setupBasicListeners() {
        this.bind(YProxyEventName.deleted, (_newValue, _oldValue, isLocal: boolean) => {
            if (isLocal) return;
            this.yData = undefined;
            this.parent.cacheHandler.clearCacheEntry(this.key);
        }, this, false);

        this.bind(YProxyEventName.updated, (_newValue, _oldValue, isLocal: boolean) => {
            if (isLocal) return;
            this.yData = this.parent.getByKey(this.key) as YType;
        }, this, false);
    }

    private getFromPath(path: (string | number)[], reference: YProxy): YProxy {
        for (const key of path) {
            reference = reference.getProxyByKey(key);
            if (!reference) return undefined;
        }
        return reference;
    }
}