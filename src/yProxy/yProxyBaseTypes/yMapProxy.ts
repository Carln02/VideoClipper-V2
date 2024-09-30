import {YProxy} from "../yProxy/yProxy";
import {YProxyFactory} from "../yProxyFactory/yProxyFactory";
import {YAbstractType, YMap, YProxyChanged, YValue} from "../yProxy/types/base.types";
import {YProxyEventName} from "../yProxy/types/events.types";

export class YMapProxy<Type extends object = object> extends YProxy<YMap, Type> {
    public static toYjs(object: object, key: string, parent: YProxy, factory: YProxyFactory): YMap {
        if (object instanceof YMap) return object;
        if (object instanceof YAbstractType) throw new Error("Converting a non-compatible Yjs type to YMap.");

        const yMap = new YMap();
        if (parent) parent.setByKey(key, yMap);

        const yMapProxy: YProxy = parent.getProxyByKey(key);
        Object.entries(object).forEach(([childKey, value]) => factory.toYjs(value, childKey, yMapProxy));

        return yMap;
    }

    public static canHandle(data: unknown): boolean {
        return (data !== null && typeof data === "object" && !(data instanceof YAbstractType)) || (data instanceof YMap);
    }

    protected diffChanges(newValue: Type, toBeDeleted: boolean = false, oldValue: Type = this.value): YProxyChanged {
        const changed: YProxyChanged = {
            selfChanged: false,
            entryChanged: false,
            subTreeChanged: false,
        };

        if (toBeDeleted) {
            this.changeHandler.scheduleChange(newValue, oldValue, YProxyEventName.deleted);
            changed.selfChanged = true;
            return changed;
        }

        if (typeof newValue !== "object" || newValue === null) {
            throw new Error("Invalid value for YMapProxy");
        }

        const keysToDelete = new Set(this.getYjsKeys());

        for (const [key, newChildValue] of Object.entries(newValue)) {
            keysToDelete.delete(key);

            const childProxy = this.getProxyByKey(key);

            if (childProxy) {
                const childChanged = (childProxy as YMapProxy).diffChanges(newChildValue, false, oldValue[key]);
                if (childChanged.selfChanged) changed.entryChanged = true;
                if (childChanged.entryChanged || childChanged.subTreeChanged) changed.subTreeChanged = true;
            } else {
                this.factory.toYjs(newChildValue, key, this);
                const proxy = this.getProxyByKey(key);
                proxy.callbackHandler.dispatchCallbacks(YProxyEventName.added, undefined, true);
                changed.entryChanged = true;
            }
        }

        for (const key of keysToDelete) {
            const childProxy = this.getProxyByKey(key);
            if (childProxy) {
                (childProxy as YMapProxy).diffChanges(undefined, true, oldValue[key]);
                changed.entryChanged = true;
            }
        }

        return changed;
    }


    public getByKey(key: string | number): unknown {
        if (!this.yData) return undefined;
        return this.yData.get(key.toString());
    }

    public setByKey(key: string | number, value: YValue): boolean {
        this.yData.set(key.toString(), value);
        return true;
    }

    public deleteByKey(key: string | number): boolean {
        this.yData.delete(key.toString());
        return true;
    }

    public hasByKey(key: string | number): boolean {
        return this.yData.has(key.toString());
    }

    public getYjsKeys(): string[] {
        return Array.from(this.yData.keys());
    }

    public toJSON(): Type {
        const result: Type = {} as Type;

        // Loop through the keys of the YMap
        for (const key of this.getYjsKeys()) {
            const proxy = this.getProxyByKey(key) as YMapProxy;

            if (proxy) result[key] = proxy.value;
            else result[key] = this.yData.get(key);
        }

        return result;
    }
}