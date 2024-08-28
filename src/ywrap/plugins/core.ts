import * as Y from 'yjs'
import * as T from "../ywrap.types";

export let handlers: Record<string, T.TypeHandler> = {};

handlers.Object = {
	from_yjs: function(ymap: T.YjsMap, recurse: boolean = false): Object {
		let res = {};

		for(let [key, value] of ymap.entries_forced())
			if(!key.startsWith("_ywrap_"))
				res[key] = value;

		return res;
	},

	to_yjs: function(ymap: T.YjsMap, object: Object, convert_to_yjs: T.Converter): void {
		for(let key in object)
			if(!key.startsWith("_ywrap_"))
				ymap.set(key, convert_to_yjs(object[key], key, ymap));
	},

	diff_from_yjs: function(ymap: T.YjsMap, old_object: Object): void {
		let current_keys = Object.keys(old_object);
		let remote_keys = [...ymap.keys()].filter(key => !key.startsWith("_ywrap_"));
		let deleted_keys = current_keys.filter(key => !remote_keys.includes(key));

		for(let key of deleted_keys)
			delete old_object[key];

		for(let key of remote_keys)
			if(old_object[key] !== ymap.get(key))
				old_object[key] = ymap.get(key);
	},

	diff_to_yjs: function(ymap: T.YjsMap, new_object: Object): void {
		let current_keys = Object.keys(new_object);
		let remote_keys = [...ymap.keys()].filter(key => !key.startsWith("_ywrap_"));
		let deleted_keys = remote_keys.filter(key => !current_keys.includes(key));

		for(let key of deleted_keys)
			ymap.delete(key);

		for(let key of current_keys)
			if(ymap.get(key) !== new_object[key])
				ymap.set(key, new_object[key]);
	}
}

handlers.Array = {
	from_yjs: function(ymap: T.YjsMap, recurse: boolean = false): any[] {
		return ymap.get_forced("_ywrap_array").array_forced();
	},

	to_yjs: function(ymap: T.YjsMap, array: any[], convert_to_yjs: T.Converter): void {
		let yarray = new Y.Array();
		for(let index in array) yarray.push([convert_to_yjs(array[index], index, ymap)]);
		yarray._prelimParent = ymap;
		ymap.set("_ywrap_array", yarray);
	},

	diff_from_yjs: function(ymap: T.YjsMap, old_array: any[]): void {
		let remote_state = ymap.get("_ywrap_array");
		let new_array = remote_state.toArray();

		let added_values = new_array.filter(value => !old_array.includes(value));

		for(let i in new_array) {
			let index = parseInt(i);	//	IMPORTANT, DO NOT REMOVE (I took the whole afternoon to debug this LMAO)
			let new_value = new_array[index];

			while(old_array[index] !== new_value) {
				if(added_values[0] == new_value)
					old_array.splice(index, 0, added_values.splice(0, 1));
				else if(index < old_array.length)
					old_array.splice(index, 1)
				else
					old_array.push(new_array[index])
			}
		}
	},

	diff_to_yjs: function(ymap: T.YjsMap, new_array: any[]): void {
		let remote_state = ymap.get("_ywrap_array");
		let remote_array = remote_state.toArray();

		let added_values = new_array.filter(value => !remote_array.includes(value));

		for(let i in new_array) {
			let index = parseInt(i);	//	IMPORTANT, DO NOT REMOVE (I took the whole afternoon to debug this LMAO)
			let new_value = new_array[index];

			while(remote_state.get(index) !== new_value) {
				if(added_values[0] == new_value)
					remote_state.insert(index, added_values.splice(0, 1));
				else if(index < remote_state.length)
					remote_state.delete(index)
				else
					remote_state.push([new_array[index]])
			}
		}
	}
}


