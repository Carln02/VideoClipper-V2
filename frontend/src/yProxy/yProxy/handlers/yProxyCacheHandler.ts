import {YProxy} from "../yProxy";
import {YValue} from "../types/base.types";

export class YProxyCacheHandler {
    private readonly proxy: YProxy;
    private readonly proxyCache: Map<string | number, YProxy>;

    public constructor(proxy: YProxy) {
        this.proxy = proxy;
        this.proxyCache = new Map();
    }

    public clearCache() {
        this.proxyCache.forEach(proxy => proxy.cacheHandler.clearCache());
        this.proxyCache.clear();
    }

    public hasCachedProxy(key: string | number): boolean {
        return this.proxyCache.has(key);
    }

    public generateAndCacheProxy(key: string | number, value: YValue): YProxy {
        if (this.proxyCache.has(key)) return this.proxyCache.get(key);
        const proxy = this.proxy.factory.generateYProxy(value, key, this.proxy);
        if (proxy) this.proxyCache.set(key, proxy);
    }

    public getCachedProxy(key: string | number): YProxy {
        key = key.toString();
        //Check if the value is in the cache
        if (this.proxyCache.has(key)) return this.proxyCache.get(key);
        //Otherwise --> compute it
        const value = this.proxy.getByKey(key);
        const proxy = this.proxy.factory.generateYProxy(value, key, this.proxy);
        if (proxy) this.proxyCache.set(key, proxy);
        return proxy || undefined;
    }

    public clearCacheEntry(key: string | number) {
        if (this.proxyCache.has(key)) this.proxyCache.get(key).cacheHandler.clearCache();
        this.proxyCache.delete(key);
    }
}