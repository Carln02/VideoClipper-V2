import {YArray} from "../../conversionManagment/yjsEnhancement";
import {YProxy} from "../yProxy";
import {YValue} from "../yProxy.types";
import {YProxyFactory} from "../../yProxyFactory/yProxyFactory";

export class YArrayProxy<Type extends unknown[] = unknown[]> extends YProxy<YArray, Type> {
    public static toYjs(array: unknown[], factory: YProxyFactory): YArray {
        const yArray = new YArray();
        array.forEach((item) => yArray.push([factory.toYjs(item)]));
        return yArray;
    }

    public static canHandle(data: unknown, factory: YProxyFactory): boolean {
        return typeof data == "object" && Array.isArray(data);
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

    protected setByKey(key: number, value: YValue): boolean {
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