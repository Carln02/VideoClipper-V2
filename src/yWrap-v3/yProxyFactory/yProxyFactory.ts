import {YProxy} from "../yProxy/yProxy";
import {YValue} from "../yProxy/yProxy.types";
import {YProxyHandler} from "./yProxyFactory.types";
import {YPrimitiveProxy} from "../yProxy/types/yPrimitiveProxy";
import {YArrayProxy} from "../yProxy/types/yArrayProxy";
import {YMapProxy} from "../yProxy/types/yMapProxy";
import {YAbstractType, YMap} from "../conversionManagment/yjsEnhancement";
import {YRootProxy} from "../yProxy/types/yRootProxy";

export class YProxyFactory {
    public readonly constructors: YProxyHandler[] = [];
    public readonly root: YRootProxy;

    public constructor(root: YMap) {
        this.add({
            canHandle: YPrimitiveProxy.canHandle,
            toYjs: YPrimitiveProxy.toYjs,
            constructor: YPrimitiveProxy,
        }, {
            canHandle: YArrayProxy.canHandle,
            toYjs: YArrayProxy.toYjs,
            constructor: YArrayProxy,
        }, {
            canHandle: YMapProxy.canHandle,
            toYjs: YMapProxy.toYjs,
            constructor: YMapProxy,
        });

        this.root = new YRootProxy(root, this);
    }

    public add(...entries: YProxyHandler[]) {
        entries.forEach(entry => this.constructors.push(entry));
    }

    public toYjs(data: unknown): YValue {
        if (data instanceof YAbstractType) return data as YValue;

        for (const constructor of this.constructors) {
            if (constructor.canHandle(data, this)) return constructor.toYjs(data, this);
        }

        return data as YValue;
    }

    public generateYProxy(data: unknown, key: string | number, parent: YProxy): YProxy {
        if (data === undefined || data === null) return undefined;

        for (const constructor of this.constructors) {
            if (constructor.canHandle(data, this)) {
                const proxy = new constructor.constructor(data, key, parent, this);
                return proxy.generateProxy();
            }
        }

        return undefined;
    }
}