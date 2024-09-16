import {YMap, YArray} from "../conversionManagment/yjsEnhancement";
import {YPath, YPathEntry, YWrapCallback, YWrapEventName} from "../eventManagement/eventManagement.types";
import {yjsToWrapped, yMapToWrapped} from "../conversionManagment/converter";
import {dispatch_callbacks_local} from "../eventManagement/observer";
import {ReservedKeys, YWrappedInfo, YWrappedObject} from "./yWrapper.types";

//	Built-in YWrapper observability functions

export function bind(info: YWrappedInfo, eventType: YWrapEventName, callback: YWrapCallback, context?: object) {
    info.callbacks.push({
        eventType: eventType,
        callback: callback,
        context: context
    });
}

export function get_observable(info: YWrappedInfo): boolean {
    return info.yMap.getForced(ReservedKeys.observable) ?? false;
}

export function set_observable(info: YWrappedInfo): void {
    const pinfo = has_parent(info) ? get_parent(info).get_key().truncateStart(15) + "." : "";
    const finfo = pinfo + get_key(info).truncateEnd(15);
    console.log("Do make observable " + finfo);

    info.yMap.set(ReservedKeys.observable, true);
}

export function get_observers(info: YWrappedInfo): object[] {
    //	Clean list before returning
    info.observers = info.observers.filter(ref => ref.deref() != undefined);

    //	Return dereferenced nodes
    return info.observers.map(ref => ref.deref());
}

export function observe(info: YWrappedInfo, thing: object): void {
    const pinfo = has_parent(info) ? get_parent(info).get_key().truncateStart(15) + "." : "";
    const finfo = pinfo + get_key(info).truncateEnd(15);
    console.log("Do observe " + finfo + " <- " + thing.constructor.name);

    if (!get_observable(info))
        throw `Cannot observe ${finfo}: please make this object observable first !`;

    //	Use weak ref so we don't prevent garbage collection of the calling object (!!!)
    const ref = new WeakRef(thing);
    info.observers.push(ref);

    //	Fire initial callbacks
    forward_callbacks(info, thing, "init");
}

export function unobserve(info: YWrappedInfo, thing: object): void {
    const pinfo = has_parent(info) ? get_parent(info).get_key().truncateStart(15) + "." : "";
    const finfo = pinfo + get_key(info).truncateEnd(15);
    console.log("Do unobserve " + finfo + " <- " + thing.constructor.name);

    if (!get_observable(info))
        throw `Cannot unobserve ${finfo}: please make this object observable first !`;

    //	Unobserve by filtering
    info.observers.filter(ref => ref.deref() && ref.deref() != thing);
}

export function forward_callbacks(info: YWrappedInfo, thing: object, change_type: string = "add"): void {
    const wrapped = yMapToWrapped(info.yMap);

    for (const key in info.rawObject)
        if (!(Object.values(ReservedKeys) as string[]).includes(key))
            dispatch_callbacks_local(
                wrapped,
                key,
                change_type,
                {old: undefined, new: yjsToWrapped(info.rawObject[key])},
                [thing],
                false
            );
}

export function destroy_observers(info: YWrappedInfo): void {
    for (const observer of get_observers(info))
        if ("destroy" in observer && typeof observer.destroy == "function") observer.destroy();
}

export function get_closest_observable_parent(info: YWrappedInfo, path: YPath = []): YWrappedObject | undefined {
    if (get_observable(info)) {
        const wrapped = yMapToWrapped(info.yMap);
        return wrapped;
    } else {
        path.push(get_key(info));
        return get_parent(info)?.get_closest_observable_parent(path);
    }
}

export function has_parent(info: YWrappedInfo): boolean {
    return info.parent != null;
}

export function get_parent(info: YWrappedInfo): YWrappedObject | undefined {
    return has_parent(info) ? yMapToWrapped(info.parent) : undefined;
}

export function unwrap(info: YWrappedInfo): YWrappedInfo {
    return info;
}

export function get_key(info: YWrappedInfo): YPathEntry {
    const name = info.yMap.getForced(ReservedKeys.nodeName);
    const parent = get_parent(info);

    if (parent != undefined && parent.unwrap().rawObject[name] !== info.yMap) {
        parent.reindex();
        return info.yMap.getForced(ReservedKeys.nodeName);
    }

    return name;
}

export function toJSON<Type = object>(info: YWrappedInfo): Type {
    const result = {};

    for (const [key, value] of info.yMap.entriesForced()) {
        if ((Object.values(ReservedKeys) as string[]).includes(key)) continue;

        if (value instanceof YMap) result[key] = toJSON({
            yMap: value as YMap,
            rawObject: info.rawObject[key],
            parent: info.yMap,
            observers: [],
            callbacks: [],
            batchTimer: null
        });

        else if (value instanceof YArray) result[key] = value.toArray().map(item =>
                item instanceof YMap || item instanceof YArray
                    ? toJSON({
                        yMap: item as YMap,
                        rawObject: item,
                        parent: info.yMap,
                        observers: [],
                        callbacks: [],
                        batchTimer: null
                    })
                    : item
            );

        else result[key] = value;
    }
    return result as Type;
}

export function reindex(info: YWrappedInfo): void {
    for (const key in info.rawObject)
        if (info.rawObject[key] instanceof YMap)
            info.rawObject[key].set(ReservedKeys.nodeName, key);
}