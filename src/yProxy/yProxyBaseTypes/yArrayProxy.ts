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

    protected customProxyGetter(prop: string | symbol): unknown {
        const methodName = prop.toString();
        if (!["push", "unshift", "insert", "splice", "indexOf"].includes(methodName)) return this.yData[methodName];

        return (...args: unknown[]) => {
            if (methodName == "indexOf") {
                if (!args[0]) return -1;
                if (args[0] instanceof YProxy) return args[0].key;
                for (const i of this.getYjsKeys()) {
                    if (this.getProxyByKey(i).value == args[0]) return i;
                }
                return -1;
            }

            let index: number;
            switch (methodName) {
                case "push":
                    index = this.yData.length;
                    break;
                case "unshift":
                    index = 0;
                    break;
                case "insert":
                case "splice":
                    if (typeof args[0] !== "number") {
                        throw new TypeError(`Expected a number for index in ${methodName} method.`);
                    }
                    index = args[0] as number;
                    break;
                default:
                    throw new Error(`Unsupported method: ${methodName}`);
            }

            const executeOperation = () => {
                if (methodName == "splice") {
                    const toDelete = args[1] as number;
                    if (toDelete) {
                        for (let i = index + toDelete - 1; i >= index; i--) {
                            const proxy = this.getProxyByKey(i);
                            if (proxy) (proxy as YArrayProxy).diffChanges(undefined, true);
                        }
                    }
                }

                const startArgIndex = methodName == "splice" ? 2 : methodName == "insert" ? 1 : 0;
                const itemsToAdd = args.slice(startArgIndex);

                if (itemsToAdd.length > 0) itemsToAdd.forEach((item, i) => {
                    const currentIndex = index + i;
                    // this.yData.insert(currentIndex, [""]);
                    this.factory.toYjs(item, currentIndex, this);
                    const proxy = this.getProxyByKey(currentIndex);
                    proxy.callbackHandler.dispatchCallbacks(YProxyEventName.added, undefined, true);
                });
            };

            const doc = this.getDoc();
            if (doc) doc.transact(executeOperation);
            else executeOperation();

            return this.yData.length;
        };
    }

    public getByKey(key: number): unknown {
        return this.yData.get(key);
    }

    public setByKey(key: number, value: YValue): boolean {
        if (this.yData.length < key) this.deleteByKey(key);
        this.yData.insert(key, [value]);
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
        const keys = [];
        for (let i = 0; i < this.yData.length; i++) keys.push(i);
        return keys;
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