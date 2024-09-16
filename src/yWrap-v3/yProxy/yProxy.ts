import {
    YEventTypes,
    YPath,
    YRawEventType,
    YValue,
    YWrapCallback,
    YWrapCallbackType,
    YProxyEventName
} from "./yProxy.types";
import {YProxyFactory} from "../yProxyFactory/yProxyFactory";
import {YMapProxy} from "./types/yMapProxy";

export abstract class YProxy<YType extends YValue = any, DataType = any> {
    protected yData: YType;

    public readonly key: string | number;
    public readonly parent: YProxy;

    public changesThrottlingTime: 200;

    public readonly factory: YProxyFactory;

    private __internal__changeToken: number;
    private __internal__pendingChange: DataType;
    private __internal__hasPendingChange: boolean;
    private __internal__toBeDeleted: boolean;

    private readonly __internal__eventListeners: Map<YProxyEventName, YWrapCallbackType[]>;
    private readonly __internal__proxyCache: Map<string | number, YProxy>;

    private __internal__timer: NodeJS.Timeout;

    public constructor(data: DataType | YType, key: string | number, parent: YProxy, factory: YProxyFactory) {
        this.factory = factory;
        this.yData = this.factory.toYjs(data) as YType;

        this.key = key;
        this.parent = parent;

        this.__internal__changeToken = 0;

        this.__internal__eventListeners = new Map();
        this.__internal__proxyCache = new Map();

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
        if (this.__internal__toBeDeleted) return undefined;
        if (this.__internal__hasPendingChange) return this.__internal__pendingChange;
        return this.toJSON();
    }

    //To be overridden

    protected abstract toJSON(): DataType;

    protected abstract getByKey(key: string | number): unknown;

    protected abstract setByKey(key: string | number, yValue: YValue): boolean;

    protected abstract deleteByKey(key: string | number): boolean;

    protected abstract hasByKey(key: string | number): boolean;

    protected abstract getYjsKeys(): string[];

    //Public utilities

    public getRoot(): YMapProxy {
        let parent: YProxy = this;
        while (parent != null) parent = parent.parent;
        return parent as YMapProxy;
    }

    public getPath(): (string | number)[] {
        const path = [];
        let parent: YProxy = this;
        while (parent != null) {
            if (parent.key != null) path.push(parent.key);
            parent = parent.parent;
        }
        return path.reverse();
    }

    public bind(eventType: YProxyEventName, callback: YWrapCallback, context?: object, executeOnBind: boolean = false) {
        if (!this.__internal__eventListeners.has(eventType)) this.__internal__eventListeners.set(eventType, []);
        this.__internal__eventListeners.get(eventType)!.push({
            callback: callback,
            context: context
        });
    }

    public unbind(eventType: YProxyEventName, callback: YWrapCallback) {
        const callbacks = this.__internal__eventListeners.get(eventType);
        if (!callbacks) return;
        this.__internal__eventListeners.set(eventType, callbacks.filter(entry => entry.callback !== callback));
    }

    public getFromLocalPath(path: Array<string | number>): YProxy {
        return this.getFromPath(path, this);
    }

    public getFromAbsolutePath(path: Array<string | number>): YProxy {
        return this.getFromPath(path, this.getRoot());
    }

    public clearCache() {
        this.__internal__proxyCache.forEach(proxy => proxy.clearCache());
        this.__internal__proxyCache.clear();
    }

    //Event listeners management

    protected fire(newValue: unknown, oldValue: unknown, isLocal: boolean, path: YPath, ...eventTypes: YProxyEventName[]) {
        eventTypes.forEach(eventType => {
            const callbacks = this.__internal__eventListeners.get(eventType);
            if (callbacks) callbacks.forEach(entry => {
                if (entry.context) entry.callback.call(entry.context, newValue, oldValue, isLocal, path, this);
                else entry.callback(newValue, oldValue, isLocal, path, this);
            });
        });
    }

    protected dispatchCallbacks(type: YRawEventType, newValue: DataType, oldValue: DataType, isLocal: boolean,
                             path: (string | number)[] = this.getPath()) {
        const eventTypes = YProxy.getEventTypes(type);

        this.fire(newValue, oldValue, isLocal, path, eventTypes.event, YProxyEventName.changed,
            eventTypes.selfOrSubTreeEvent, YProxyEventName.selfOrSubTreeChanged);

        let parent = this.parent;
        if (!parent) return;

        parent.fire(newValue, oldValue, isLocal, path, eventTypes.entryEvent, YProxyEventName.entryChanged);

        while (parent != null) {
            parent.fire(newValue, oldValue, isLocal, path, eventTypes.subTreeEvent, YProxyEventName.subTreeChanged);
            parent = parent.parent;
        }
    }

    private setupBasicListeners() {
        this.bind(YProxyEventName.deleted, () => {
            this.yData = undefined;
            this.parent.clearCacheEntry(this.key);
        }, this);

        this.bind(YProxyEventName.updated, (newValue: DataType) => {
            this.yData = this.factory.toYjs(newValue) as YType;
        }, this);
    }

    //Scheduling and applying changes

    private scheduleChange(value: DataType, isDelete: boolean = false) {
        this.__internal__changeToken++;

        this.__internal__hasPendingChange = !isDelete;
        this.__internal__toBeDeleted = isDelete;
        this.__internal__pendingChange = isDelete ? null : value;

        const token = this.__internal__changeToken;

        if (this.__internal__timer) clearTimeout(this.__internal__timer);
        this.__internal__timer = setTimeout(() => {
            if (token != this.__internal__changeToken) return;

            if (this.__internal__toBeDeleted) {
                this.parent.clearCacheEntry(this.key);
                this.parent.deleteByKey(this.key);
            } else if (this.__internal__hasPendingChange) {
                this.parent.toYjsAndSetByKey(this.key, this.__internal__pendingChange);
            }

            this.__internal__hasPendingChange = false;
            this.__internal__toBeDeleted = false;
            this.__internal__pendingChange = null;
        }, this.changesThrottlingTime);
    }

    //Proxy generation method

    protected generateProxy(): this & DataType {
        return new Proxy(this, {
            get: (target: YProxy<YType, DataType>, prop: string) => {
                if (Object.prototype.hasOwnProperty.call(target, prop)) {
                    if (prop.startsWith("__internal__")) throw new Error("Attempting to access internal field.");
                    return target[prop];
                }
                if (typeof target != "object") return undefined;
                return target.getCachedProxy(prop);
            },
            set: (target: YProxy<YType, DataType>, prop: string, value) => {
                if (Object.prototype.hasOwnProperty.call(target, prop)) return false;
                if (typeof target.yData != "object") target.setByKey(undefined, undefined);

                const child = target.getCachedProxy(prop);

                if (!child) {
                    child.dispatchCallbacks(YProxyEventName.added, value, undefined, true);
                    target.toYjsAndSetByKey(prop, value);
                } else {
                    this.dispatchCallbacks(YProxyEventName.updated, value, child.value, true);
                    child.scheduleChange(value);
                }
                return true;
            },
            deleteProperty: (target: YProxy<YType, DataType>, prop: string) => {
                if (Object.prototype.hasOwnProperty.call(target, prop)) return false;
                if (typeof target.yData != "object") target.deleteByKey(undefined);

                const child = target.getCachedProxy(prop);
                if (child) {
                    child.dispatchCallbacks(YProxyEventName.deleted, undefined, child.value, true);
                    child.scheduleChange(null, true);
                }
                return true;
            },
            has: (target: YProxy<YType, DataType>, prop: string) =>
                Object.prototype.hasOwnProperty.call(target, prop) || target.hasByKey(prop),
            ownKeys: (target: YProxy<YType, DataType>) => target.getYjsKeys(),
            getOwnPropertyDescriptor: (target: YProxy<YType, DataType>, prop: string) => {
                prop = prop.toString();
                if (Object.prototype.hasOwnProperty.call(target, prop)) {
                    if (prop.startsWith("__internal__")) return undefined;
                    const descriptor = Object.getOwnPropertyDescriptor(target, prop);
                    if (descriptor) return {...descriptor, configurable: true, enumerable: true};
                }

                if (target.hasByKey(prop)) return {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: target.getCachedProxy(prop)
                };

                return undefined;
            },
        }) as this & DataType;
    }

    //Operations support

    public valueOf(): DataType {
        return this.value;
    }

    public toString(): string {
        return this.value.toString();
    }

    //Private utilities

    protected getCachedProxy(key: string | number): YProxy {
        key = key.toString();
        //Check if the value is in the cache
        if (this.__internal__proxyCache.has(key)) return this.__internal__proxyCache.get(key);
        //Otherwise --> compute it
        const proxy = this.factory.generateYProxy(this.getByKey(key), key, this);
        if (proxy) this.__internal__proxyCache.set(key, proxy);
        return proxy || undefined;
    }

    private toYjsAndSetByKey(key: string | number, value: unknown): YValue {
        const yValue = this.factory.toYjs(value);
        this.setByKey(key, yValue);
        return yValue;
    }

    protected clearCacheEntry(key: string | number) {
        if (this.__internal__proxyCache.has(key)) this.__internal__proxyCache.get(key).clearCache();
        this.__internal__proxyCache.delete(key);
    }

    private getFromPath(path: (string | number)[], reference: YProxy): YProxy {
        for (const key of path) {
            reference = reference.getCachedProxy(key);
            if (!reference) return undefined;
        }
        return reference;
    }

    private static getEventTypes(type: YRawEventType): YEventTypes {
        return {
            event: type,
            entryEvent: type == YProxyEventName.added ? YProxyEventName.entryAdded
                : type == YProxyEventName.updated ? YProxyEventName.entryUpdated
                    : YProxyEventName.entryDeleted,
            subTreeEvent: type == YProxyEventName.added ? YProxyEventName.subTreeAdded
                : type == YProxyEventName.updated ? YProxyEventName.subTreeUpdated
                    : YProxyEventName.subTreeDeleted,
            selfOrSubTreeEvent: type == YProxyEventName.added ? YProxyEventName.selfOrSubTreeAdded
                : type == YProxyEventName.updated ? YProxyEventName.selfOrSubTreeUpdated
                    : YProxyEventName.selfOrSubTreeDeleted,
        };
    }
}