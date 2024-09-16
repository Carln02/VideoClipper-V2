import {YMap} from "../conversionManagment/yjsEnhancement";
import {diffFromYjs, yjsToWrapped, yMapToWrappedIfExists} from "../conversionManagment/converter";
import {YPath, YPathEntry} from "./eventManagement.types";
import {config} from "../config";
import {YEvent} from "yjs";
import {ReservedKeys, YWrappedObject} from "../yWrapper/yWrapper.types";
import {YChangeList, YCallbackCache, YChange} from "./eventManagement.types";

export function content_observer(events: YEvent<any>[]) {
    const generic_callback_cache: Map<string, YCallbackCache> = new Map();

    console.log("TRANSACTION START ++++++++++++")
//	console.log("Origin:", transaction.origin);

    events.forEach((event) => {
        //Update the YWrapped object if exists
        const localItem = yMapToWrappedIfExists(event.target);
        const localInfo = localItem?.unwrap();
        diffFromYjs(localInfo);

        //Find the closest binding node above event location
        let target: YMap = event.currentTarget as YMap;

        let boundNode: YMap; //Closest binding parent, which will receive the callbacks
        let boundNodeIsRoot: boolean; //This tells us that target == boundNode
        let boundField: YPathEntry;	//The bound node's direct child which contains the changes
        let nodePath: string = ""; //This is used to identify the boundField that changed
        let fieldPath: YPath = []; //Event location relative to the boundField

        for (const key of event.path) {
            target = target.get(key.toString());

            if (target.get(ReservedKeys.observable)) {
                boundNode = target; //This is the binding parent, which will receive the callbacks
                boundNodeIsRoot = true; //Remember these changes apply to direct children of boundNode
                boundField = null; //We don't know which fields have changed yet
                nodePath += fieldPath.join("."); //Complete the field path up till here
                fieldPath = []; //The bound node itself has changed
            } else if (boundNodeIsRoot) {
                boundNodeIsRoot = false; //Remember these changes do NOT apply to direct children of boundNode
                boundField = key; //This is the bound node's direct child which contains our changes
                nodePath += `.${key}.`; //Complete the field path up till here
                fieldPath = []; //One of the bound node's direct children has changed
            } else if ((Object.values(ReservedKeys) as string[]).includes(key.toString())) {
                fieldPath.push(key);
            }
        }

		// console.log("boundNode:", boundNode)
		// console.log("node path:", nodePath)
		// console.log("field path:",fieldPath)

        if (!boundNode) return;	//Nothing to call back to. Exit.
        if (!boundNodeIsRoot && !config.subtree_events) return; //Not firing subtree events. Exit.
        if (target != event.target) throw "Am I stupid or something?"; //No idea how tf this would happen. Panic.

        const observers = yMapToWrappedIfExists(boundNode)?.get_observers();
        if (!observers || observers.length == 0) return;

        //Inventory changes in normal format
        const changes: YChangeList = {add: {}, update: {}, delete: {}};

        event.changes.keys.forEach((change, key) => {
            if (change.action == "add")
                changes.add[key] = {
                    old: undefined,
                    new: yjsToWrapped(event.target.get(key))
                };

            if (change.action == "update")
                changes.update[key] = {
                    old: yjsToWrapped(change.oldValue),
                    new: yjsToWrapped(event.target.get(key))
                };

            if (change.action == "delete")
                changes.delete[key] = {
                    old: yjsToWrapped(change.oldValue),
                    new: undefined
                };
        });

        //Also for this stupid delta format...
        let index = 0;
        let deleteIndex = 0;

        event.changes.delta.forEach(change => {
            if (change.retain) index += change.retain;
            if (change.insert) {
                for (const loop in change.insert as unknown[]) {
                    changes.add[index] = {
                        old: undefined,
                        new: yjsToWrapped(event.target.get(index))
                    }
                    index++;
                }
            }
            if (change.delete) {
                const goal = index + change.delete;
                while (index < goal) {
                    changes.delete[index] = {
                        old: yjsToWrapped(event.changes.deleted[deleteIndex].content),
                        new: undefined
                    }
                    deleteIndex++;
                    index++;
                }
            }
        })

        console.log("Changes:", changes);

        //	Dispatch callbacks
        const changed = boundNodeIsRoot
            ? dispatch_callbacks_root(observers, fieldPath, changes)
            : dispatch_callbacks_subtree(observers, boundField.toString(), fieldPath, changes);

        //	Queue generic callback
        if (changed && !generic_callback_cache.has(nodePath))
            generic_callback_cache.set(nodePath, {boundNode: boundNode, boundField: boundField?.toString(), observers: []});
    });

    //	Dispatch generic events
    for (const [, info] of generic_callback_cache) {
        const new_value = yjsToWrapped(info.boundNode[info.boundField]);
        dispatch_callbacks_generic(info.observers, info.boundField, {old: undefined, new: new_value, local: false});
    }

    console.log("TRANSACTION END ------------")
}


//	Instant local callbacks

export function dispatch_callbacks_local(parent: YWrappedObject, key: string, change_type: string, change: YChange, observers: any[] = null, dispatch_generic: boolean = true) {
    const path = [];
    const bound_node = parent.get_closest_observable_parent(path);
    if (bound_node == undefined) return;

    path.reverse();
    if (path.length > 0) path.push(key);

    const bound_field = path.shift() ?? key;
    if (!observers) observers = bound_node.get_observers();

    for (const observer of observers) {
        const changed = dispatch_callback(
            observer,
            bound_field,
            change_type,
            path,
            change
        );

        if (changed && dispatch_generic) dispatch_callback(
            observer,
            bound_field,
            "generic",
            [],
            {old: undefined, new: bound_node[bound_field], local: true}
        );
    }
}


//	You didn't think I wasn't gonna dispatch those callbacks at some point, did you ?

function dispatch_callbacks_root(observers: object[], path: YPath, changes: YChangeList): boolean {
    let changed = true;

    for (const change_type in changes)
        for (const sub_field in changes[change_type])
            for (const observer of observers)
                changed = changed && dispatch_callback(
                    observer,
                    sub_field,
                    change_type,
                    path,
                    changes[change_type][sub_field]
                );

    return changed;
}

function dispatch_callbacks_subtree(observers: object[], bound_field: string, path: YPath, changes: YChangeList): boolean {
    let changed = true;

    for (const change_type in changes)
        for (const sub_field in changes[change_type])
            for (const observer of observers)
                changed = changed && dispatch_callback(
                    observer,
                    bound_field,
                    change_type,
                    path.concat(sub_field),
                    changes[change_type][sub_field]
                );

    return changed;
}

function dispatch_callbacks_generic(observers: object[], bound_field: string, change: YChange): boolean {
    let changed = true;

    for (const observer of observers)
        changed = changed && dispatch_callback(
            observer,
            bound_field,
            "generic",
            [],
            change
        );

    return changed;
}

function dispatch_callback(observer: object, bound_field: string, change_type: string, base_path: YPath, change: YChange): boolean {
    if (change.old == change.new)
        return false;

    const formats = config.events[change_type];
    const field = capitalize(bound_field);

    for (const format of formats) {
        const action = capitalize(format.action);
        const callback = format.fallback ? `on${action}` : `on${field}${action}`;

        if (observer[callback]) {
            const path = format.fallback ? ([bound_field] as YPath).concat(base_path) : base_path;
            const args = format.arguments(change);

            console.log(`Scheduling callback ${observer.constructor.name}.${callback.truncateEnd(15)} for [${path.truncateStart(30)}], ${change.old?.truncateEnd(15)} -> ${change.new?.truncateEnd(15)}`);
            setTimeout(() => {
                observer[callback](...args, path)
            }, 0);

            break;
        }
    }

    return true;
}

function capitalize(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
}