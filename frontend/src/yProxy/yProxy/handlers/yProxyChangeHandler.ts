import {YProxy} from "../yProxy";
import {YValue} from "../types/base.types";
import {YProxyEventName, YRawEventType} from "../types/events.types";

export class YProxyChangeHandler<Type = unknown> {
    private readonly proxy: YProxy<YValue, Type>;

    private changeToken: number;
    private timer: NodeJS.Timeout;

    private pendingChange: Type;
    private hasPendingChange: boolean;
    private _toBeDeleted: boolean;

    public constructor(proxy: YProxy<YValue, Type>) {
        this.proxy = proxy;
        this.changeToken = 0;
    }

    public getProxyValue(): Type {
        if (this.toBeDeleted) return undefined;
        if (this.hasPendingChange) return this.pendingChange;
        return this.proxy.toJSON();
    }

    public get toBeDeleted(): boolean {
        return this._toBeDeleted;
    }
    
    public scheduleChange(newValue: Type, oldValue: Type, changeType: YRawEventType) {
        this.changeToken++;
        const token = this.changeToken;

        this.hasPendingChange = changeType !== YProxyEventName.deleted;
        this._toBeDeleted = changeType === YProxyEventName.deleted;
        this.pendingChange = this.toBeDeleted ? null : newValue;

        this.proxy.callbackHandler.dispatchCallbacks(changeType, oldValue, true);

        if (changeType == YProxyEventName.added) return;

        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            if (token != this.changeToken) return;

            if (this.toBeDeleted) {
                this.proxy.parent.cacheHandler.clearCacheEntry(this.proxy.key);
                this.proxy.parent.deleteByKey(this.proxy.key);
            } else if (this.hasPendingChange) {
                this.proxy.yData = this.proxy.factory.toYjs(this.pendingChange, this.proxy.key, this.proxy.parent);
            }

            this.hasPendingChange = false;
            this._toBeDeleted = false;
            this.pendingChange = null;
        }, YProxy.changesThrottlingTime);
    }
}