import {YProxy} from "../yProxy/yProxy";
import {YProxyFactory} from "../yProxyFactory/yProxyFactory";
import {YAbstractType, YArray, YProxyChanged, YValue} from "../yProxy/types/base.types";
import {YProxyEventName} from "../yProxy/types/events.types";

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
            this.changeHandler.scheduleChange(newValue, oldValue, YProxyEventName.deleted);
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

            const childProxy = this.getProxyByKey(i);

            if (i < newValue.length) {
                if (childProxy) {
                    const childChanged = (childProxy as YArrayProxy).diffChanges(newItem, false, oldItem);
                    if (childChanged.selfChanged) changed.entryChanged = true;
                    if (childChanged.entryChanged || childChanged.subTreeChanged) changed.subTreeChanged = true;
                } else {
                    this.factory.toYjs(newItem, i, this);
                    const proxy = this.getProxyByKey(i);
                    proxy.callbackHandler.dispatchCallbacks(YProxyEventName.added, undefined, true);
                    changed.entryChanged = true;
                }
            } else if (childProxy) {
                (childProxy as YArrayProxy).diffChanges(undefined, true, oldItem);
                changed.entryChanged = true;
            }
        }

        return changed;
    }

    public getByKey(key: number): unknown {
        return this.yData.get(key);
    }

    public setByKey(key: number, value: YValue): boolean {
        this.yData.doc?.transact(() => {
            this.deleteByKey(key);
            this.yData.insert(key, [value]);
        });
        return true;
    }

    public deleteByKey(key: number): boolean {
        this.yData.delete(key, 1);
        return true;
    }

    public hasByKey(key: number): boolean {
        return key >= 0 && this.yData.length > key;
    }

    public getYjsKeys(): string[] {
        return new Array(this.yData.length).map((item, index) => index.toString());
    }

    public toJSON(): Type {
        const result: Type = [] as Type;

        for (let i = 0; i < this.yData.length; i++) {
            const proxy = this.getProxyByKey(i) as YArrayProxy;

            // If it's a proxy, call toJSON() on it, otherwise use the value directly
            if (proxy) result.push(proxy.value);
            else result.push(this.yData.get(i));
        }

        return result;
    }
}