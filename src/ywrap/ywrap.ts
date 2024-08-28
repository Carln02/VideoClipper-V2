import * as Y from 'yjs'
import * as T from "./ywrap.types"

import "./internals/fixes/yjs"
import "./internals/fixes/nicetext"

import content_observer from "./internals/sync"
import * as convert from "./internals/convert"



//	Public wrap function

export default function wrap(ymap: T.YjsMap): T.YWrappedObject {
	let res = convert.ymap_to_wrapped_if_exists(ymap);
	if(res != undefined) return res;

	ymap.set("_ywrap_realtype", "Object");
	ymap.set("_ywrap_nodename", "root");

	ymap.observeDeep(content_observer);

	return convert.ymap_to_wrapped(ymap);
}
