import {
    YEventTypes,
    YPath,
    YProxyChanged,
    YProxyEventName,
    YRawEventType,
    YValue,
    YWrapCallback,
    YWrapCallbackData
} from "./yProxy.types";
import {YProxyFactory} from "../yProxyFactory/yProxyFactory";
import {YMapProxy} from "./types/yMapProxy";
import {equalToAny} from "turbodombuilder";
import {TurboWeakSet} from "../../client/utils/weakSet/weakSet";

export abstract class YProxy<YType extends YValue = YValue, DataType = unknown> {
    protected yData: YType;

    public readonly key: string | number;
    public readonly parent: YProxy;

    public static changesThrottlingTime: 500;

    public readonly factory: YProxyFactory;

    private readonly __internal__boundObjects: TurboWeakSet;

    private __internal__changeToken: number;
    protected __internal__pendingChange: DataType;
    protected __internal__hasPendingChange: boolean;
    protected __internal__toBeDeleted: boolean;

    private readonly __internal__eventListeners: Map<YProxyEventName, YWrapCallbackData[]>;
    private readonly __internal__proxyCache: Map<string | number, YProxy>;

    private __internal__timer: NodeJS.Timeout;

    public constructor(data: DataType | YType, key: string | number, parent: YProxy, factory: YProxyFactory) {
        this.factory = factory;
        this.yData = this.factory.toYjs(data, key, parent) as YType;

        this.key = key;
        this.parent = parent;

        this.__internal__boundObjects = new TurboWeakSet();

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

    public get boundObjects(): object[] {
        return this.__internal__boundObjects.toArray();
    }

    //To be overridden

    protected abstract diffChanges(newValue: DataType, toBeDeleted?: boolean, oldValue?: DataType): YProxyChanged;

    protected abstract diffAndUpdate(data: unknown): void;

    protected abstract toJSON(): DataType;

    protected abstract getByKey(key: string | number): unknown;

    public abstract setByKey(key: string | number, yValue: YValue): boolean;

    protected abstract deleteByKey(key: string | number): boolean;

    protected abstract hasByKey(key: string | number): boolean;

    protected abstract getYjsKeys(): string[];

    //Public utilities

    public getRoot(): YMapProxy {
        let current: YProxy = this;
        while (current.parent != null) current = current.parent;
        return current as YMapProxy;
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

    public bind(eventType: YProxyEventName, callback: YWrapCallback, context?: object, executeOnBind: boolean = true) {
        if (!this.__internal__eventListeners.has(eventType)) this.__internal__eventListeners.set(eventType, []);

        const callbackData: YWrapCallbackData = {callback: callback, context: context};
        this.__internal__eventListeners.get(eventType)!.push(callbackData);
        if (context) this.__internal__boundObjects.add(context);
        if (executeOnBind) this.initializeCallback(eventType, callbackData);
    }

    public unbindCallback(eventType: YProxyEventName, callback: YWrapCallback) {
        const callbacks = this.__internal__eventListeners.get(eventType);
        if (!callbacks) return;

        const boundObjectToTest = callbacks.find(entry => entry.callback == callback).context;
        this.__internal__eventListeners.set(eventType, callbacks.filter(entry => entry.callback !== callback));

        if (!boundObjectToTest) return;
        for (const [, listeners] of this.__internal__eventListeners) {
            for (const listener of listeners) {
                if (listener.context == boundObjectToTest) return;
            }
        }
        this.unbindObject(boundObjectToTest);
    }

    public unbindObject(context: object) {
        this.__internal__boundObjects.delete(context);
        this.__internal__eventListeners.forEach((listeners, key) => {
            this.__internal__eventListeners.set(key, listeners.filter(entry => entry.context != context));
        });
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
        this.__internal__proxyCache.forEach(proxy => proxy.clearCache());
        this.__internal__proxyCache.clear();
    }

    //Event listeners management

    protected fire(newValue: unknown, oldValue: unknown, isLocal: boolean, path: YPath, ...eventTypes: YProxyEventName[]) {
        eventTypes.forEach(eventType => {
            const callbacks = this.__internal__eventListeners.get(eventType);
            if (callbacks) callbacks.forEach(entry => this.executeCallback(entry, newValue, oldValue, isLocal, path));
        });
    }

    private executeCallback(callbackData: YWrapCallbackData, newValue: unknown, oldValue: unknown, isLocal: boolean, path: YPath) {
        if (callbackData.context) callbackData.callback.call(callbackData.context, newValue, oldValue, isLocal, path, this);
        else callbackData.callback(newValue, oldValue, isLocal, path, this);
    }

    private initializeCallback(eventType: YProxyEventName, callbackData: YWrapCallbackData) {
        const path = this.getPath();
        if (equalToAny(eventType, YProxyEventName.added, YProxyEventName.changed, YProxyEventName.updated,
            YProxyEventName.selfOrSubTreeAdded, YProxyEventName.selfOrSubTreeChanged, YProxyEventName.selfOrSubTreeUpdated)) {
            this.executeCallback(callbackData, this, this, false, path);
        } else if (equalToAny(eventType, YProxyEventName.entryAdded, YProxyEventName.entryChanged, YProxyEventName.entryUpdated)) {
            this.getYjsKeys().forEach(key => {
                const value = this.getCachedProxy(key);
                this.executeCallback(callbackData, value, value, false, [...path, key]);
            });
        }
    }

    protected dispatchCallbacks(eventType: YRawEventType, oldValue: DataType, isLocal: boolean,
                                path: (string | number)[] = this.getPath()) {
        const eventTypes = YProxy.getEventTypes(eventType);

        this.fire(this, oldValue, isLocal, path, eventTypes.event, YProxyEventName.changed,
            eventTypes.selfOrSubTreeEvent, YProxyEventName.selfOrSubTreeChanged);

        let parent = this.parent;
        if (!parent) return;

        parent.fire(this, oldValue, isLocal, path, eventTypes.entryEvent, YProxyEventName.entryChanged);

        while (parent != null) {
            parent.fire(this, oldValue, isLocal, path, eventTypes.subTreeEvent, YProxyEventName.subTreeChanged);
            parent = parent.parent;
        }
    }

    private setupBasicListeners() {
        this.bind(YProxyEventName.deleted, (_newValue, _oldValue, isLocal: boolean) => {
            if (isLocal) return;
            this.yData = undefined;
            this.parent.clearCacheEntry(this.key);
        }, this, false);

        this.bind(YProxyEventName.updated, (newValue: DataType, _oldValue, isLocal: boolean) => {
            if (isLocal) return;
            this.diffAndUpdate(newValue);
        }, this, false);
    }


    //Scheduling and applying changes

    // protected diffChanges(newValue: DataType, toBeDeleted: boolean = false, oldValue = this.value): YProxyChanged {
    //     const changed: YProxyChanged = {
    //         selfChanged: false,
    //         entryChanged: changedParent.selfChanged || false,
    //         subTreeChanged: changedParent.entryChanged || changedParent.subTreeChanged || false,
    //     };
    //
    //     this.__internal__toBeDeleted = toBeDeleted;
    //
    //     if (toBeDeleted) {
    //         this.__internal__hasPendingChange = false;
    //         this.__internal__pendingChange = null;
    //         this.dispatchCallbacks(YProxyEventName.deleted, oldValue, true);
    //         this.scheduleChange();
    //         changed.selfChanged = true;
    //         return changed;
    //     }
    //
    //     //Primitive override
    //     if (typeof oldValue !== "object" || oldValue === null
    //         || typeof newValue !== "object" || newValue === null) {
    //         if (oldValue === newValue) return changed;
    //         this.__internal__hasPendingChange = true;
    //         this.__internal__pendingChange = newValue as DataType;
    //         this.dispatchCallbacks(YProxyEventName.updated, oldValue, true);
    //         this.scheduleChange();
    //         return {...changed, selfChanged: true};
    //     }
    //
    //     const keysToDelete = new Set(this.getYjsKeys());
    //
    //     //Map override
    //     for (const [key, newChildValue] of Object.entries(newValue)) {
    //         keysToDelete.delete(key);
    //
    //         if (key in oldValue) {
    //             const proxy = this.getCachedProxy(key);
    //             const childChanged = proxy.diffChanges(newChildValue, false, changed, oldValue[key]);
    //             if (childChanged.selfChanged) changed.entryChanged = true;
    //             if (childChanged.entryChanged || childChanged.subTreeChanged) changed.subTreeChanged = true;
    //         } else {
    //             this.factory.toYjs(newChildValue, key, this);
    //             const proxy = this.getCachedProxy(key);
    //             proxy.dispatchCallbacks(YProxyEventName.added, undefined, true);
    //             proxy.scheduleChange();
    //         }
    //     }
    //
    //     return changed;
    // }

    // private scheduleChange() {
    //     this.__internal__changeToken++;
    //     const token = this.__internal__changeToken;
    //
    //     if (this.__internal__timer) clearTimeout(this.__internal__timer);
    //     this.__internal__timer = setTimeout(() => {
    //         if (token != this.__internal__changeToken) return;
    //
    //         if (this.__internal__toBeDeleted) {
    //             this.parent.clearCacheEntry(this.key);
    //             this.parent.deleteByKey(this.key);
    //         } else if (this.__internal__hasPendingChange) {
    //             this.diffAndUpdate(this.__internal__pendingChange);
    //         }
    //
    //         this.__internal__hasPendingChange = false;
    //         this.__internal__toBeDeleted = false;
    //         this.__internal__pendingChange = null;
    //     }, YProxy.changesThrottlingTime);
    // }

    protected scheduleChange(newValue: DataType, oldValue: DataType, changeType: YRawEventType) {
        this.__internal__changeToken++;

        const isDeleted = changeType == YProxyEventName.deleted;
        this.__internal__hasPendingChange = !isDeleted;
        this.__internal__toBeDeleted = isDeleted;
        this.__internal__pendingChange = isDeleted ? null : newValue;

        const token = this.__internal__changeToken;
        this.dispatchCallbacks(changeType, oldValue, true);

        if (changeType == YProxyEventName.added) return;

        if (this.__internal__timer) clearTimeout(this.__internal__timer);
        this.__internal__timer = setTimeout(() => {
            if (token != this.__internal__changeToken) return;

            //TODO FIX THIS
            if (this.__internal__toBeDeleted) {
                this.parent.clearCacheEntry(this.key);
                this.parent.deleteByKey(this.key);
            } else if (this.__internal__hasPendingChange) {
                this.parent.setByKey(this.key, this.__internal__pendingChange as YValue);
                // this.diffAndUpdate(this.__internal__pendingChange);
            }

            this.__internal__hasPendingChange = false;
            this.__internal__toBeDeleted = false;
            this.__internal__pendingChange = null;
        }, YProxy.changesThrottlingTime);
    }

    //Proxy generation method

    public generateProxy(): this & DataType {
        return new Proxy(this, {
            get: (target: YProxy<YType, DataType>, prop: string | symbol) => {
                if (prop === Symbol.toPrimitive) return (hint: string) => target[Symbol.toPrimitive](hint);
                if (prop in target || prop.toString().startsWith("__internal__")) return target[prop];
                return target?.getCachedProxy(prop.toString());
            },
            set: (target: YProxy<YType, DataType>, prop: string, value) => {
                if (prop.startsWith("__internal__") || prop in target) {
                    if (typeof target[prop] == "function") throw new Error("Unable to set prototype method.");
                    target[prop] = value;
                    return true;
                }

                if (typeof target.yData != "object") return true;

                const child = target.getCachedProxy(prop);
                if (child) {
                    child.diffChanges(value, false, child.value);
                } else {
                    target.factory.toYjs(value, prop, target);
                    const proxy = target.getCachedProxy(prop);
                    proxy.scheduleChange(value, undefined, YProxyEventName.added);
                }
                return true;
            },
            deleteProperty: (target: YProxy<YType, DataType>, prop: string) => {
                if (prop.startsWith("__internal__") || prop in target) return false;
                if (typeof target.yData != "object") return target.deleteByKey(undefined);

                const child = target.getCachedProxy(prop);
                if (child) child.diffChanges(undefined, true);
                return true;
            },
            has: (target: YProxy<YType, DataType>, prop: string) =>
                prop in target || target.hasByKey(prop),
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

    public toString(): string {
        return this.value.toString();
    }

    //Private utilities

    protected getCachedProxy(key: string | number): YProxy {
        key = key.toString();
        //Check if the value is in the cache
        if (this.__internal__proxyCache.has(key)) return this.__internal__proxyCache.get(key);
        //Otherwise --> compute it
        const value = this.getByKey(key);
        const proxy = this.factory.generateYProxy(value, key, this);
        if (proxy) this.__internal__proxyCache.set(key, proxy);
        return proxy || undefined;
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