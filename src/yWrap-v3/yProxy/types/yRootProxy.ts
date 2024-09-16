import {YAbstractType} from '../../conversionManagment/yjsEnhancement';
import {YProxyFactory} from "../../yProxyFactory/yProxyFactory";
import {Transaction, YArrayEvent, YEvent, YMapEvent} from "yjs";
import {YRawEventType, YProxyEventName} from "../yProxy.types";
import {YMapProxy} from "./yMapProxy";
import {YMap} from "yjs/dist/src/types/YMap";
import {YProxy} from "../yProxy";

export class YRootProxy<Type extends object = object> extends YMapProxy<Type> {
    constructor(data: Type | YMap<Type>, factory: YProxyFactory) {
        super(data, null, null, factory);
        this.setupDeepObserver();
    }

    private setupDeepObserver() {
        if (!(this.yData instanceof YAbstractType)) return;
        this.yData.observeDeep((events, transaction) => {
            for (const event of events) this.processYEvent(event, transaction);
        });
    }

    private processYEvent(event: YEvent<any>, transaction: Transaction) {
        if (transaction.local) return;

        const path = event.path;
        const target = this.getFromLocalPath(path);

        if (event instanceof YMapEvent) this.processYMapEvent(event, target, path);
        else if (event instanceof YArrayEvent) this.processArrayEvent(event, target, path);
    }

    private processYMapEvent(event: YMapEvent<any>, target: YProxy, path: (string | number)[]) {
        event.changes.keys.forEach((change, key) => {
            const eventType = YRootProxy.yjsToYProxyEventName(change.action);
            (target as YRootProxy).dispatchCallbacks(
                eventType,
                eventType == YProxyEventName.deleted ? undefined : target[key],
                eventType == YProxyEventName.added ? undefined : change.oldValue,
                false,
                [...path, key]
            );
        });
    }

    private processArrayEvent(event: YArrayEvent<any>, target: YProxy, path: (string | number)[]) {
        let index = 0;
        event.changes.delta.forEach((change) => {
            if (change.insert) {
                const insertCount = change.insert.length || 1;
                for (let i = 0; i < insertCount; i++) {
                    (target as YRootProxy).dispatchCallbacks(YProxyEventName.added, target[index], undefined,
                        false, [...path, index]);
                    index++;
                }
            } else if (change.delete) {
                for (let i = 0; i < change.delete; i++) {
                    (target as YRootProxy).dispatchCallbacks(YProxyEventName.deleted, undefined,
                        undefined, // You might need to store the old value to provide it here
                        false, [...path, index]);
                }
            } else if (change.retain) {
                index += change.retain;
            }
        });
    }


    private static yjsToYProxyEventName(type: "add" | "delete" | "update"): YRawEventType {
        return type == "add" ? YProxyEventName.added
            : type == "delete" ? YProxyEventName.deleted
                : YProxyEventName.updated;
    }
}