import {YAbstractType, YMap} from "../../conversionManagment/yjsEnhancement";
import {YProxy} from "../yProxy";
import {YProxyChanged, YProxyEventName, YValue} from "../yProxy.types";
import {YProxyFactory} from "../../yProxyFactory/yProxyFactory";

export class YMapProxy<Type extends object = object> extends YProxy<YMap, Type> {
    public static toYjs(object: object, key: string, parent: YProxy, factory: YProxyFactory): YMap {
        if (object instanceof YMap) return object;
        if (object instanceof YAbstractType) throw new Error("Converting a non-compatible Yjs type to YMap.");

        const yMap = new YMap();
        if (parent) (parent as YMapProxy).setByKey(key, yMap);

        const yMapProxy: YProxy = (parent as YMapProxy).getCachedProxy(key);
        Object.entries(object).forEach(([key, value]) => factory.toYjs(value, key, yMapProxy));

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
            this.scheduleChange(newValue, oldValue, YProxyEventName.deleted);
            changed.selfChanged = true;
            return changed;
        }

        if (typeof newValue !== "object" || newValue === null) {
            throw new Error("Invalid value for YMapProxy");
        }

        const keysToDelete = new Set(this.getYjsKeys());

        for (const [key, newChildValue] of Object.entries(newValue)) {
            keysToDelete.delete(key);

            const childProxy = this.getCachedProxy(key);

            if (childProxy) {
                const childChanged = (childProxy as YMapProxy).diffChanges(newChildValue, false, oldValue[key]);
                if (childChanged.selfChanged) changed.entryChanged = true;
                if (childChanged.entryChanged || childChanged.subTreeChanged) changed.subTreeChanged = true;
            } else {
                this.factory.toYjs(newChildValue, key, this);
                const proxy = this.getCachedProxy(key);
                (proxy as YMapProxy).scheduleChange(newChildValue, undefined, YProxyEventName.added);
                changed.entryChanged = true;
            }
        }

        for (const key of keysToDelete) {
            const childProxy = this.getCachedProxy(key);
            if (childProxy) {
                (childProxy as YMapProxy).diffChanges(undefined, true, oldValue[key]);
                changed.entryChanged = true;
            }
        }

        return changed;
    }


    public diffAndUpdate(data: Type): void {
        //TODO MAKE ALSO DIFF AND UPDATE FOR PENDING CHANGE (SO WHEN SETTING A BIG BLOCK OF DATA, EACH HAS ITS OWN
        // TIMER. AND ALSO STORE IN VAR OLD VALUE FOR CALLBACKS
        if (typeof data !== "object" || data === null) throw new Error("Data to update must be an object.");

        const yMap = this.yData as YMap;
        const keysToDelete = new Set<string>(yMap.keys());

        for (const [key, newValue] of Object.entries(data)) {
            keysToDelete.delete(key);

            const currentYValue = yMap.get(key);
            if (!currentYValue) {
                this.factory.toYjs(newValue, key, this);
            } else {
                const childProxy = this.getCachedProxy(key);
                if (childProxy) (childProxy as YMapProxy).diffAndUpdate(newValue);
                else this.factory.toYjs(newValue, key, this);
            }
        }

        for (const key of keysToDelete) yMap.delete(key);
    }


    protected getByKey(key: string | number): unknown {
        if (!this.yData) return undefined;
        return this.yData.getForced(key.toString());
    }

    public setByKey(key: string | number, value: YValue): boolean {
        this.yData.set(key.toString(), value);
        return true;
    }

    protected deleteByKey(key: string | number): boolean {
        this.yData.delete(key.toString());
        return true;
    }

    protected hasByKey(key: string | number): boolean {
        return this.yData.has(key.toString());
    }

    protected getYjsKeys(): string[] {
        return Array.from(this.yData.keys());
    }

    protected toJSON(): Type {
        const result: Type = {} as Type;

        // Loop through the keys of the YMap
        for (const key of this.getYjsKeys()) {
            const proxy = this.getCachedProxy(key) as YMapProxy;

            if (proxy) result[key] = proxy.toJSON();
            else result[key] = this.yData.get(key);
        }

        return result;
    }
}