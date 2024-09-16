import {YMap, YAbstractType} from "../../conversionManagment/yjsEnhancement";
import {YProxy} from "../yProxy";
import {YValue} from "../yProxy.types";
import {YProxyFactory} from "../../yProxyFactory/yProxyFactory";

export class YMapProxy<Type extends object = object> extends YProxy<YMap, Type> {
    public static toYjs(object: object, factory: YProxyFactory): YMap {
        const yMap = new YMap();

        Object.entries(object).forEach(([key, value]) => {
            if (typeof value === "object" && value !== null && !(value instanceof YAbstractType)) {
                // Recursively convert nested objects or arrays to YMaps or YArrays
                yMap.set(key, factory.toYjs(value));
            } else {
                // Otherwise, set primitive values directly
                yMap.set(key, value);
            }
        });

        return yMap;
    }

    public static canHandle(data: unknown, factory: YProxyFactory): boolean {
        return typeof data == "object";
    }

    protected getByKey(key: string | number): unknown {
        return this.yData.get(key.toString());
    }

    protected setByKey(key: string | number, value: YValue): boolean {
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