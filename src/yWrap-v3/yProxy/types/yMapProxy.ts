import {YMap, YAbstractType} from "../../conversionManagment/yjsEnhancement";
import {YProxy} from "../yProxy";
import {YValue} from "../yProxy.types";
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