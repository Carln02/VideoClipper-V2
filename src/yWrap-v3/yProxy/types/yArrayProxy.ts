import {YAbstractType, YArray} from "../../conversionManagment/yjsEnhancement";
import {YProxy} from "../yProxy";
import {YProxyChanged, YProxyEventName, YValue} from "../yProxy.types";
import {YProxyFactory} from "../../yProxyFactory/yProxyFactory";

export class YArrayProxy<Type extends unknown[] = unknown[]> extends YProxy<YArray, Type> {
    public static toYjs(array: unknown[], key: number, parent: YProxy, factory: YProxyFactory): YArray {
        if (array instanceof YArray) return array;
        if (array instanceof YAbstractType) throw new Error("Converting a non-compatible Yjs type to YArray.");

        const yArray = new YArray();
        if (parent) (parent as YArrayProxy).setByKey(key, yArray);

        const yArrayProxy: YProxy = parent[key];
        array.forEach((item, key) => yArray.push([factory.toYjs(item, key, yArrayProxy)]));
        return yArray;
    }


    public static canHandle(data: unknown): boolean {
        return (typeof data == "object" && Array.isArray(data) && !(data instanceof YAbstractType)) || data instanceof YArray;
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

        if (!Array.isArray(newValue)) {
            throw new Error("Invalid value for YArrayProxy");
        }

        const maxLength = Math.max(oldValue.length, newValue.length);
        for (let i = 0; i < maxLength; i++) {
            const oldItem = oldValue[i] as unknown[];
            const newItem = newValue[i] as unknown[];

            const childProxy = this.getCachedProxy(i);

            if (i < newValue.length) {
                if (childProxy) {
                    const childChanged = (childProxy as YArrayProxy).diffChanges(newItem, false, oldItem);
                    if (childChanged.selfChanged) changed.entryChanged = true;
                    if (childChanged.entryChanged || childChanged.subTreeChanged) changed.subTreeChanged = true;
                } else {
                    this.factory.toYjs(newItem, i, this);
                    const proxy = this.getCachedProxy(i);
                    (proxy as YArrayProxy).scheduleChange(newItem, undefined, YProxyEventName.added);
                    changed.entryChanged = true;
                }
            } else if (childProxy) {
                (childProxy as YArrayProxy).diffChanges(undefined, true, oldItem);
                changed.entryChanged = true;
            }
        }

        return changed;
    }

    public diffAndUpdate(data: unknown): void {
        if (typeof data !== "object" || data === null || !Array.isArray(data)) {
            this.factory.toYjs(data, this.key, this.parent);
            return;
        }

        const yArray = this.yData as YArray;
        const keysToDelete = new Set<number>();
        for (let i = 0; i < yArray.length; i++) keysToDelete.add(i);

        for (const [key, newValue] of Object.entries(data)) {
            const index = Number.parseInt(key);
            keysToDelete.delete(index);

            const currentYValue = yArray.get(index);
            if (!currentYValue) {
                this.factory.toYjs(newValue, index, this);
            } else {
                const childProxy = this.getCachedProxy(index);
                if (childProxy) (childProxy as YArrayProxy).diffAndUpdate(newValue);
                else this.factory.toYjs(newValue, index, this);
            }
        }

        for (const key of keysToDelete) yArray.delete(key);
    }

    public set(index: number, value: unknown) {
        this.yData.doc?.transact(() => {
            this.deleteByKey(index);
            this.yData.insert(index, [value]);
        });
    }

    protected getByKey(key: number): unknown {
        return this.yData.get(key);
    }

    public setByKey(key: number, value: YValue): boolean {
        this.set(key, value);
        return true;
    }

    protected deleteByKey(key: number): boolean {
        this.yData.delete(key, 1);
        return true;
    }

    protected hasByKey(key: number): boolean {
        return key >= 0 && this.yData.length > key;
    }

    protected getYjsKeys(): string[] {
        return new Array(this.yData.length).map((item, index) => index.toString());
    }

    protected toJSON(): Type {
        const result: Type = [] as Type;

        for (let i = 0; i < this.yData.length; i++) {
            const proxy = this.getCachedProxy(i) as YArrayProxy;

            // If it's a proxy, call toJSON() on it, otherwise use the value directly
            if (proxy) result.push(proxy.toJSON());
            else result.push(this.yData.get(i));
        }

        return result;
    }
}