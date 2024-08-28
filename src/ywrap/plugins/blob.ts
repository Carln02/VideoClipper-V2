import * as Y from 'yjs'
import * as T from "../ywrap.types";

export let handlers: Record<string, T.TypeHandler> = {};

handlers.Blob = {
	from_yjs: function(ymap: T.YjsMap, recurse: boolean = false): Promise<Blob> {
		return new Promise(async resolve => {
			let sub_doc = ymap.get("_ywrap_subdoc");
			sub_doc.load();

			await wait_doc(sub_doc);
			let blob = sub_doc.getMap("contents").get("blob") as Blob;
			resolve(blob);
		})
	},

	to_yjs: function(ymap: T.YjsMap, blob: Blob, convert_to_yjs: T.Converter): void {
		let sub_doc = new Y.Doc();
		let sub_map = sub_doc.getMap("contents");

		sub_map.set("blob", blob);
		ymap.set("_ywrap_subdoc", sub_doc);
	},

	diff_from_yjs: function(ymap: T.YjsMap, old_blob: Blob): void {
		throw "Ywrapper Blob plugin: Blob diffing is not supported !"
	},

	diff_to_yjs: function(ymap: T.YjsMap, new_blob: Blob): void {
		throw "Ywrapper Blob plugin: Blob diffing is not supported !"
	}
}

let wait_doc = function(ydoc: Y.Doc): Promise<Y.Doc> {
	return new Promise((resolve, reject) => {
		//	Document amready populated
		if(ydoc.share.size > 0) resolve(ydoc);
		//	Resolve on update
		ydoc.once("update", () => resolve(ydoc));
		//	Reject after 10 seconds
		setTimeout(() => reject(), 10000);
	})
}
