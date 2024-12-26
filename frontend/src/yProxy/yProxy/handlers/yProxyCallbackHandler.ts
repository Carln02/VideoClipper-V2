import {TurboWeakSet} from "../../../client/utils/weakSet/weakSet";
import {YProxy} from "../yProxy";
import {equalToAny} from "turbodombuilder";
import {YEventTypes, YProxyEventName, YRawEventType, YCallback, YCallbackData} from "../types/events.types";
import {YPath} from "../types/base.types";

export class YProxyCallbackHandler {
    private readonly proxy: YProxy;

    private readonly boundObjectsSet: TurboWeakSet;
    private readonly eventListeners: Map<YProxyEventName, YCallbackData[]>;

    public constructor(proxy: YProxy) {
        this.proxy = proxy;
        this.boundObjectsSet = new TurboWeakSet();
        this.eventListeners = new Map();
    }

    public get boundObjects(): object[] {
        return this.boundObjectsSet.toArray();
    }

    public bind(eventType: YProxyEventName, callback: YCallback, context?: object, executeOnBind: boolean = true) {
        if (!this.eventListeners.has(eventType)) this.eventListeners.set(eventType, []);

        const callbackData: YCallbackData = {callback: callback, context: context};
        this.eventListeners.get(eventType)!.push(callbackData);
        this.bindObject(context);
        if (executeOnBind) this.initializeCallback(eventType, callbackData);
    }

    public bindObject(object: object) {
        if (object) this.boundObjectsSet.add(object);
    }

    public unbindCallback(eventType: YProxyEventName, callback: YCallback) {
        const callbacks = this.eventListeners.get(eventType);
        if (!callbacks) return;

        const boundObjectToTest = callbacks.find(entry => entry.callback == callback).context;
        this.eventListeners.set(eventType, callbacks.filter(entry => entry.callback !== callback));

        if (!boundObjectToTest) return;
        for (const [, listeners] of this.eventListeners) {
            for (const listener of listeners) {
                if (listener.context == boundObjectToTest) return;
            }
        }
        this.unbindObject(boundObjectToTest);
    }

    public unbindObject(context: object) {
        this.boundObjectsSet.delete(context);
        this.eventListeners.forEach((listeners, key) => {
            this.eventListeners.set(key, listeners.filter(entry => entry.context != context));
        });
    }

    //Event listeners management

    private fire(newValue: YProxy, oldValue: unknown, isLocal: boolean, path: YPath, ...eventTypes: YProxyEventName[]) {
        eventTypes.forEach(eventType => {
            const callbacks = this.eventListeners.get(eventType);
            if (callbacks) callbacks.forEach(entry => this.executeCallback(entry, newValue, oldValue, isLocal, path));
        });
    }

    private executeCallback(callbackData: YCallbackData, newValue: YProxy, oldValue: unknown, isLocal: boolean, path: YPath) {
        if (callbackData.context) callbackData.callback.call(callbackData.context, newValue, oldValue, isLocal, path, this.proxy);
        else callbackData.callback(newValue, oldValue, isLocal, path, this.proxy);
    }

    private initializeCallback(eventType: YProxyEventName, callbackData: YCallbackData) {
        const path = this.proxy.getPath();
        if (equalToAny(eventType, YProxyEventName.added, YProxyEventName.changed, YProxyEventName.updated,
            YProxyEventName.selfOrSubTreeAdded, YProxyEventName.selfOrSubTreeChanged, YProxyEventName.selfOrSubTreeUpdated)) {
            this.executeCallback(callbackData, this.proxy, undefined, false, path);
        } else if (equalToAny(eventType, YProxyEventName.entryAdded, YProxyEventName.entryChanged, YProxyEventName.entryUpdated)) {
            this.proxy.getYjsKeys().forEach(key => {
                const value = this.proxy.getProxyByKey(key);
                this.executeCallback(callbackData, value, undefined, false, [...path, key]);
            });
        }
    }

    public dispatchCallbacks(eventType: YRawEventType, oldValue: unknown, isLocal: boolean,
                                path: (string | number)[] = this.proxy.getPath()) {
        const eventTypes = YProxyCallbackHandler.getEventTypes(eventType);

        this.fire(this.proxy, oldValue, isLocal, path, eventTypes.event, YProxyEventName.changed,
            eventTypes.selfOrSubTreeEvent, YProxyEventName.selfOrSubTreeChanged);

        let parent = this.proxy.parent;
        if (!parent) return;

        parent.callbackHandler.fire(this.proxy, oldValue, isLocal, path, eventTypes.entryEvent, YProxyEventName.entryChanged);

        while (parent != null) {
            parent.callbackHandler.fire(this.proxy, oldValue, isLocal, path, eventTypes.subTreeEvent, YProxyEventName.subTreeChanged,
                eventTypes.selfOrSubTreeEvent, YProxyEventName.selfOrSubTreeChanged);
            parent = parent.parent;
        }
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