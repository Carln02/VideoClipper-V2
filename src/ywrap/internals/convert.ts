import * as Y from 'yjs';
import * as T from "../ywrap.types";

import * as config from "../config";
import make_proxy from "./proxy";

//	Terminology
//
//	yvalue:		any yjs value (or a primitive value)
//	ymap:		specifically a yjs map
//
//	jvalue:		any javascript value
//	jobject:	specifically a javascript object
//
//	wrapped:	ywrapped object (primitives are never wrapped)



//	Populate specific type handlers

let handlers: Record<string, T.TypeHandler> = {}

for(let plugin of config.load_plugins)
	for(let handler in plugin.handlers)
		handlers[handler] = plugin.handlers[handler];



//	Use a weak map so unused elements can be garbage collected (!!!)

let ymap_to_wrapped_cache: WeakMap<T.YjsMap, T.YWrappedObject> = new WeakMap();



//	Diff changes to and from the backing Yjs object

export function diff_from_yjs(info: T.YWrappedInfo): void {
	handlers[info.raw.constructor.name].diff_from_yjs(info.ymap, info.raw)
}

export function diff_to_yjs(info: T.YWrappedInfo): void {
	info.ymap.doc.transact(
		() => handlers[info.raw.constructor.name].diff_to_yjs(info.ymap, info.raw),
		info.ymap.doc.clientID
	);

	info.batch_timer = null;
}



//	Non-recursively convert a yjs value to a ywrapped value

export function yjs_to_wrapped(yvalue: T.YjsValue, own_property: boolean = true): T.YWrappedValue {
	//	If this is a YMap, we know we need to convert it
	if(yvalue instanceof Y.Map)
		return ymap_to_wrapped(yvalue);

	//	Just in case, who knows
	if((yvalue as any) instanceof Y.AbstractType)
		throw `Trying to convert raw ${yvalue.constructor.name}, idk what heppened here`;

	if((yvalue as any) instanceof Object && own_property)
		console.warn(`Accessing raw ${yvalue.constructor.name}, this is very suspicious`);

	//	Else, simply return the raw (primitive) value
	return yvalue;
}

export function ymap_to_wrapped(ymap: T.YjsMap): T.YWrappedObject {
	//	Don't recreate object if cached
	if(ymap_to_wrapped_cache.has(ymap))
		return ymap_to_wrapped_cache.get(ymap);

	const real_type = ymap.get_forced("_ywrap_realtype");

	if(!handlers[real_type]) {
		console.log(ymap);
		throw `Unable to handle type ${real_type}, did you forget to load a plugin ?`;
	}

	//	Else, well, create it...
	const jobject = handlers[real_type].from_yjs(ymap);

	//	Find YWrap parent
	let parent: any = ymap;

	do {
		parent = parent.parent_forced();
	} while(parent != null && !parent.has_forced?.("_ywrap_realtype"));

	//	Wrap
	const wrapped = new Proxy(jobject, make_proxy(ymap, jobject, parent));

	//	Cache and return
	ymap_to_wrapped_cache.set(ymap, wrapped);
	return wrapped;
}

export function ymap_to_wrapped_if_exists(ymap: T.YjsMap): T.YWrappedObject  {
	return ymap_to_wrapped_cache.get(ymap);
}



//	Recursively convert a javascript value to its backing yjs structure

export function javascript_to_yjs(jvalue: any, name: string, parent: T.YjsMap): T.YjsValue {
	//	If this is an object, we need to convert it
	if(jvalue instanceof Object)
		return jobject_to_yjs(jvalue, name, parent);

	//	Else, simply return the raw (primitive) value
	return jvalue;
}

export function jobject_to_yjs(jobject: Object, name: string, parent: T.YjsMap): T.YjsMap {
	let real_type = jobject.constructor.name;

	if(!handlers[real_type]) {
		console.log(real_type);
		console.log(jobject.constructor);
		throw `Unable to handle type ${real_type}, did you forget to load a plugin ?`;
	}

	//	No caching here because we always want a fresh YMap
	let ymap = new Y.Map();
	ymap.set("_ywrap_realtype", real_type);
	ymap.set("_ywrap_nodename", name);
	ymap._prelimParent = parent;

	//	Populate and return
	handlers[real_type].to_yjs(ymap, jobject, javascript_to_yjs);
	return ymap;
}


