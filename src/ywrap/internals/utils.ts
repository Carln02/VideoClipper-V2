import * as Y from 'yjs'
import * as T from "../ywrap.types";

import * as convert from "./convert"
import * as sync from "./sync"


//	Built-in YWrapper observability functions

export function get_observable(info: T.YWrappedInfo): boolean {
    return info.ymap.get_forced("_ywrap_observable") ?? false;
}

export function set_observable(info: T.YWrappedInfo): void {
    let pinfo = has_parent(info) ? get_parent(info).get_key().limit_start(15) + "." : "";
    let finfo = pinfo + get_key(info).limit(15);
    console.log("Do make observable " + finfo);

    info.ymap.set("_ywrap_observable", true);
}

export function get_observers(info: T.YWrappedInfo): Object[] {
    //	Clean list before returning
    info.observers = info.observers.filter(ref => ref.deref() != undefined);

    //	Return dereferenced nodes
    return info.observers.map(ref => ref.deref());
}

export function observe(info: T.YWrappedInfo, thing: Object): void {
    let pinfo = has_parent(info) ? get_parent(info).get_key().limit_start(15) + "." : "";
    let finfo = pinfo + get_key(info).limit(15);
    console.log("Do observe " + finfo + " <- " + thing.constructor.name);

    if (!get_observable(info))
        throw `Cannot observe ${finfo}: please make this object observable first !`;

    //	Use weak ref so we don't prevent garbage collection of the calling object (!!!)
    let ref = new WeakRef(thing);
    info.observers.push(ref);

    //	Fire initial callbacks
    forward_callbacks(info, thing, "init");
}

export function unobserve(info: T.YWrappedInfo, thing: Object): void {
    let pinfo = has_parent(info) ? get_parent(info).get_key().limit_start(15) + "." : "";
    let finfo = pinfo + get_key(info).limit(15);
    console.log("Do unobserve " + finfo + " <- " + thing.constructor.name);

    if (!get_observable(info))
        throw `Cannot unobserve ${finfo}: please make this object observable first !`;

    //	Unobserve by filtering
    info.observers.filter(ref => ref.deref() && ref.deref() != thing);
}

export function forward_callbacks(info: T.YWrappedInfo, thing: Object, change_type: string = "add"): void {
    let wrapped = convert.ymap_to_wrapped(info.ymap);

    for (let key in info.raw)
        if (!key.startsWith("_ywrap_"))
            sync.dispatch_callbacks_local(
                wrapped,
                key,
                change_type,
                {old: undefined, new: convert.yjs_to_wrapped(info.raw[key])},
                [thing],
                false
            );
}

export function destroy_observers(info: T.YWrappedInfo): void {
    for (let observer of get_observers(info))
        (observer as any).destroy?.();
}

export function get_closest_observable_parent(info: T.YWrappedInfo, path: T.Path = []): T.YWrappedObject | undefined {
    if (get_observable(info)) {
        let wrapped = convert.ymap_to_wrapped(info.ymap);
        return wrapped;
    } else {
        path.push(get_key(info));
        return get_parent(info)?.get_closest_observable_parent(path);
    }
}

export function has_parent(info: T.YWrappedInfo): boolean {
    return info.parent != null;
}

export function get_parent(info: T.YWrappedInfo): T.YWrappedObject | undefined {
    return has_parent(info) ? convert.ymap_to_wrapped(info.parent) : undefined;
}

export function unwrap(info: T.YWrappedInfo): T.YWrappedInfo {
    return info;
}

export function get_key(info: T.YWrappedInfo): T.Primitive {
    let name = info.ymap.get_forced("_ywrap_nodename");
    let parent = get_parent(info);

    if (parent != undefined && parent.unwrap().raw[name] !== info.ymap) {
        parent.reindex();
        return info.ymap.get_forced("_ywrap_nodename");
    }

    return name;
}

export function toJSON<Type = object>(info: T.YWrappedInfo): Type {
    const result = {};

    for (const [key, value] of info.ymap.entries_forced()) {
        if (key.startsWith("_ywrap_")) continue;

        if (value instanceof Y.Map) result[key] = toJSON({
            ymap: value as T.YjsMap,
            raw: info.raw[key],
            parent: info.ymap,
            observers: [],
            batch_timer: null
        });

        else if (value instanceof Y.Array) result[key] = value.toArray().map(item =>
                item instanceof Y.Map || item instanceof Y.Array
                    ? toJSON({
                        ymap: item as T.YjsMap,
                        raw: item,
                        parent: info.ymap,
                        observers: [],
                        batch_timer: null
                    })
                    : item
            );

        else result[key] = value;
    }
    return result as Type;
}

export function reindex(info: T.YWrappedInfo): void {
    for (const key in info.raw)
        if (info.raw[key] instanceof Y.Map)
            info.raw[key].set("_ywrap_nodename", key);
}