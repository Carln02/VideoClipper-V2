import {YProxy} from "../yProxy/yProxy";
import {YProxyHandler} from "./yProxyFactory.types";
import {YPrimitiveProxy} from "../yProxyBaseTypes/yPrimitiveProxy";
import {YRootProxy} from "../yProxyBaseTypes/yRootProxy";
import {YArrayProxy} from "../yProxyBaseTypes/yArrayProxy";
import {YMapProxy} from "../yProxyBaseTypes/yMapProxy";
import {YAbstractType, YMap, YValue} from "../yProxy/types/base.types";

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

        const rawRoot = new YRootProxy(root, this);
        this.root = rawRoot.getProxy();
    }

    public add(...entries: YProxyHandler[]) {
        entries.forEach(entry => this.constructors.push(entry));
    }

    public toYjs(data: unknown, key: string | number, parent: YProxy): YValue {
        if (data instanceof YAbstractType) return data as YValue;

        for (const constructor of this.constructors) {
            if (constructor.canHandle(data, this)) {
                return constructor.toYjs(data, key, parent, this);
            }
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