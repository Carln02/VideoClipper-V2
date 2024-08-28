import * as Y from 'yjs'
import * as T from "../ywrap.types";

import * as config from "../config";
import * as convert from "./convert";

type CallbackCache = {
	bound_node: T.YjsMap,
	bound_field: string,
	observers: Object[]
}

type Change = {
	old: T.YWrappedValue,
	new: T.YWrappedValue
	local?: boolean
}

type ChangeList = {
	add: Record<string, Change>,
	update: Record<string, Change>,
	delete: Record<string, Change>
}



export default function content_observer(events, transaction) {
	let generic_callback_cache: Map<string, CallbackCache> = new Map();

	console.log("TRANSACTION START ++++++++++++")
//	console.log("Origin:", transaction.origin);

	events.forEach((event) => {
		//	Update the YWrapped object if exists
		let local_item = convert.ymap_to_wrapped_if_exists(event.target);
		let local_info = local_item?.unwrap();
		if(local_info) convert.diff_from_yjs(local_info as T.YWrappedInfo);

		//	Find closest binding node above event location
		let target = event.currentTarget;

		let bound_node;			//	Closest binding parent, which will receive the callbacks
		let bound_root;			//	This tells us that target == bound_node
		let bound_field;		//	The bound node's direct child which contains the changes
		let node_path = "";		//	This is used to identify the bound_field that changed
		let field_path = [];	//	Event location relative to the bound_field

		for(let key of event.path) {
			target = target.get(key);

			if(target.get("_ywrap_observable")) {
				bound_node = target;				//	This is the binding parent, which will receive the callbacks
				bound_root = true;					//	Remember these changes apply to direct children of bound_node
				bound_field = null;					//	We don't know which fields have changed yet
				node_path += field_path.join(".")	//	Complete the field path up till here
				field_path = [];					//	The bound node itself has changed
			} else if(bound_root) {
				bound_root = false;			//	Remember these changes do NOT apply to direct children of bound_node
				bound_field = key;			//	This is the bound node's direct child which contains our changes
				node_path += `.${key}.`		//	Complete the field path up till here
				field_path = [];			//	One of the bound node's direct children has changed
			} else if(!key.startsWith?.("_ywrap_")) {
				field_path.push(key);
			}
		}

//		console.log("bound_node:", bound_node)
//		console.log("node path:", node_path)
//		console.log("field path:",field_path)

		if(!bound_node) return;												//	Nothing to call back to. Exit.
		if(!bound_root && !config.subtree_events) return;					//	Not firing subtree events. Exit.
		if(target != event.target) throw "Am I stupid or something ?";		//	No idea how tf this would happen. Panic.

		let observers = convert.ymap_to_wrapped_if_exists(bound_node)?.get_observers();
		if(!observers || observers.length == 0) return;

		//	Inventory changes in normal format
		let changes: ChangeList = { add: {}, update: {}, delete: {} };

		event.changes.keys.forEach((change, key) => {
			if(change.action == "add")
				changes.add[key] = {
					old: undefined,
					new: convert.yjs_to_wrapped(event.target.get(key))
				};

			if(change.action == "update")
				changes.update[key] = {
					old: convert.yjs_to_wrapped(change.oldValue),
					new: convert.yjs_to_wrapped(event.target.get(key))
				};

			if(change.action == "delete")
				changes.delete[key] = {
					old: convert.yjs_to_wrapped(change.oldValue),
					new: undefined
				};
		});

		//	Also for this stupid delta format...
		let index = 0;
		let del_index = 0;

		event.changes.delta.forEach(change => {
			if(change.retain) index += change.retain;
			if(change.insert) {
				for(let loop in (change.insert as any[])) {
					changes.add[index] = {
						old: undefined,
						new: convert.yjs_to_wrapped(event.target.get(index))
					}
					index++;
				}
			};
			if(change.delete) {
				let goal = index + change.delete;

				while(index < goal) {
					changes.delete[index] = {
						old: convert.yjs_to_wrapped(event.changes.deleted[del_index].content),
						new: undefined
					}

					del_index++;
					index++;
				}
			};
		})

		console.log("Changes:", changes);

		//	Dispatch callbacks
		let changed = bound_root
                    ? dispatch_callbacks_root(observers, field_path, changes)
                    : dispatch_callbacks_subtree(observers, bound_field, field_path, changes);

		//	Queue generic callback
		if(changed && !generic_callback_cache.has(node_path))
			generic_callback_cache.set(node_path, { bound_node: bound_node, bound_field: bound_field, observers: [] });
	});

	//	Dispatch generic events
	for(let [node_path, info] of generic_callback_cache) {
		let new_value = convert.yjs_to_wrapped(info.bound_node[info.bound_field]);
		dispatch_callbacks_generic(info.observers, info.bound_field, { old: undefined, new: new_value, local: false });
	};

	console.log("TRANSACTION END ------------")
}



//	Instant local callbacks

export function dispatch_callbacks_local(parent: T.YWrappedObject, key: string, change_type: string, change: Change, observers: any[] = null, dispatch_generic: boolean = true) {
	let path = [];
	let bound_node = parent.get_closest_observable_parent(path);
	if(bound_node == undefined) return;

	path.reverse();
	if(path.length > 0) path.push(key);

	let bound_field = path.shift() ?? key;
	if(!observers) observers = bound_node.get_observers();

	for(let observer of observers) {
		let changed = dispatch_callback(
			observer,
			bound_field,
			change_type,
			path,
			change
		);

		if(changed && dispatch_generic) dispatch_callback(
			observer,
			bound_field,
			"generic",
			[],
			{ old: undefined, new: bound_node[bound_field], local: true }
		);
	}
}



//	You didn't think I wasn't gonna dispatch those callbacks at some point, did you ?

function dispatch_callbacks_root(observers: Object[], path: T.Path, changes: ChangeList): boolean {
	let changed = true;

	for(let change_type in changes)
		for(let sub_field in changes[change_type])
			for(let observer of observers)
				changed = changed && dispatch_callback(
					observer,
					sub_field,
					change_type,
					path,
					changes[change_type][sub_field]
				);

	return changed;
}

function dispatch_callbacks_subtree(observers: Object[], bound_field: string, path: T.Path, changes: ChangeList): boolean {
	let changed = true;

	for(let change_type in changes)
		for(let sub_field in changes[change_type])
			for(let observer of observers)
				changed = changed && dispatch_callback(
					observer,
					bound_field,
					change_type,
					path.concat(sub_field),
					changes[change_type][sub_field]
				);

	return changed;
}

function dispatch_callbacks_generic(observers: Object[], bound_field: string, change: Change): boolean {
	let changed = true;

	for(let observer of observers)
		changed = changed && dispatch_callback(
			observer,
			bound_field,
			"generic",
			[],
			change
		);

	return changed;
}

function dispatch_callback(observer: Object, bound_field: string, change_type: string, base_path: T.Path, change: Change): boolean {
	if(change.old == change.new)
		return false;

	let formats = config.events[change_type];
	let field = capitalize(bound_field);

	for(let format of formats) {
		let action = capitalize(format.action);
		let callback = format.fallback ? `on${action}`: `on${field}${action}`;

		if(observer[callback]) {
			let path = format.fallback ? ([bound_field] as T.Path).concat(base_path) : base_path;
			let args = format.arguments(change);

			console.log(`Scheduling callback ${observer.constructor.name}.${callback.limit(15)} for [${path.limit_start(30)}], ${change.old?.limit(15)} -> ${change.new?.limit(15)}`);
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


