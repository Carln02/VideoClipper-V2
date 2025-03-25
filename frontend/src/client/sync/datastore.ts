//@ts-nocheck
import * as Y from 'yjs'
import { IndexeddbPersistence } from 'y-indexeddb'

import * as crypto from "./crypto"
import WebsocketProvider from "./websocket_manager"
import {SyncedDocumentData} from "../app/views/canvas/canvas.types";



let y_room;

let document;
let document_content;
// let factory;

let persist_provider;
let ws_provider;

export function setupDocument() {
	document = new Y.Doc();
}

export function connectToRoom(group_id, room_id) {
	y_room = `${group_id}/ROOM:${room_id}`;
	persist_provider = new IndexeddbPersistence(y_room, document);
	ws_provider = new WebsocketProvider(y_room, document);
}

export function join_room(group_id, room_id) {
	y_room = `${group_id}/ROOM:${room_id}`;

	document = new Y.Doc();
	document_content = document.getMap('document_content');
	// factory = new YProxyFactory(document_content);

	persist_provider = new IndexeddbPersistence(y_room, document);
	ws_provider = new WebsocketProvider(y_room, document);
}

export function leave_room() {
	ws_provider?.destroy();
	persist_provider?.destroy();

	document_content = undefined;
	document?.destroy();

	y_room = undefined;
}

export function documentRoot(): SyncedDocumentData {
	return null;
}

export function getDocument(): Y.Doc {
	return document;
}


//	Should be unique even offline, thanks to Yjs's ClientID
//	Though that's just a random.uint32() and might blow up the entire document if they are identical, WTF YJS ?

export async function generate_unique_id(object) {
	const generate = async function() {
		const raw = document.clientID.toString(32) + crypto.get_random_id()
		return await crypto.hash(raw);
	}

	if(!object) return await generate();

	let id;

	do {
		id = generate();
	} while(Object.hasOwn(object, id))

	return id;
}



//	Testing

window.Y = Y;

window.doc = {
	map: () => document_content,
	wrapped: () => get_doc(),
	json: () => document_content.toJSON()
}


