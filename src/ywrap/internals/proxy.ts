import * as Y from 'yjs'
import * as T from "../ywrap.types";

import * as config from "../config"
import * as utils from "./utils"
import * as sync from "./sync"
import * as convert from "./convert"



//	Main proxy handler
//	Why can't I make this a lambda ? :'(

export default function make_proxy(ymap: T.YjsMap, object: Object, parent: T.YjsMap | null) {
	let info: T.YWrappedInfo = {
		ymap: ymap,		//	TODO use WeakRef ?
		raw: object,	//	TODO use WeakRef ?
		parent: parent,
		observers: [],
		batch_timer: null
	}

	let handle = function(key, change_type, change) {
		//	Timer is already set and we don't want to reset it
		if(info.batch_timer && !config.batch_changes_rolling) return;

		//	Else, let's reset the timer !
		clearTimeout(info.batch_timer);
		info.batch_timer = setTimeout(() => convert.diff_to_yjs(info), config.batch_changes_ms) as any;

		//	TODO
		sync.dispatch_callbacks_local(convert.ymap_to_wrapped(info.ymap), key, change_type, change);
	}

	return {
		get: function(parent, key, parent_proxied) {
			//	First and foremost, forbid access to YWrapper properties
			if(key.startsWith?.("_ywrap_"))
				throw `Trying to access a protected YWrapper property, access forbidden`;

			//	If accessing one of YWrapper's util functions, simply return that
			if(key in utils)
				return (...args) => utils[key](info, ...args);

			//	Else, simply return the converted value
			let yvalue = parent[key];
			let wrapped = convert.yjs_to_wrapped(yvalue, parent.hasOwnProperty(key));

		//	console.log(`GET ${info.ymap.get_forced("_ywrap_nodename").limit_start(15)}.${key.limit(15)} ->`, shallow_print(wrapped));

			return wrapped;
		},

		set: function(parent, key, value) {
			//	First and foremost, forbid access to YWrapper properties
			if(key.startsWith?.("_ywrap_"))
				throw `Trying to write to a protected YWrapper property, access forbidden`;

			//	You also can't override YWrapper-provided utilities
			if(key in utils)
				throw `Trying to override a protected YWrapper utility, access forbidden`;

		//	console.log(`SET ${info.ymap.get_forced("_ywrap_nodename").limit_start(15)}.${key.limit(15)} <-`, shallow_print(value));

			let change_type = parent.hasOwnProperty(key) ? "update" : "add";

			//	Else, simply set the converted value
			let old = convert.yjs_to_wrapped(parent[key]);
			parent[key] = convert.javascript_to_yjs(value, key, info.ymap);
			handle(key, change_type, { old: old, new: convert.yjs_to_wrapped(parent[key]) });
			return true;
		},

		deleteProperty: function(parent, key) {
			//	First and foremost, forbid access to YWrapper properties
			if(key.startsWith?.("_ywrap_"))
				throw `Trying to write to a protected YWrapper property, access forbidden`;

			//	You also can't override YWrapper-provided utilities
			if(key in utils)
				throw `Trying to override a protected YWrapper utility, access forbidden`;

		//	console.log(`DEL ${info.ymap.get_forced("_ywrap_nodename").limit_start(15)}.${key.limit(15)}`);

			//	Else, simply delete the specified value
			let old = convert.yjs_to_wrapped(parent[key]);
			delete parent[key];
			handle(key, "delete", { old: old, new: undefined });
			return true;
		}
	}
}



function shallow_print(thing) {
	if(thing == undefined) return;
	if(thing.unwrap) thing = thing.unwrap().raw
	let res = {};
	res[thing.constructor.name] = thing.limit(15);
	return res;
}



//	handle_after(parent_proxied[key], change_type, parent_proxied[key]);

//	handle_before(parent_proxied[key], "delete", parent_proxied[key]);
//	handle_after(parent_proxied[key], false, undefined);


