import { openDB, IDBPDatabase } from 'idb';
import {SyncedMedia} from "../app/managers/mediaManager/mediaManager.types";

let dbPromise: Promise<IDBPDatabase>;

interface VideoData {
    id: number;
    metadata: SyncedMedia;
    uri: string;  // if storing actual binary data, prefer Blob
}

export function initDB() {
    if (!dbPromise) {
        dbPromise = openDB('myVideoDB', 1, {
            upgrade(db) {
                // Create an object store called "videos" with the key "id"
                if (!db.objectStoreNames.contains('videos')) {
                    const store = db.createObjectStore('videos', {
                        keyPath: 'id',     // We'll store a numeric "id" as the primary key
                        autoIncrement: true
                    });
                }
            }
        });
    }
    return dbPromise;
}

// ADD a new video. Returns the assigned ID.
export async function addVideo(uri: string | Blob, metadata: SyncedMedia): Promise<IDBValidKey> {
    const db = await initDB();
    // We'll insert an object that follows our VideoData interface
    // ID is auto-generated if we didn't explicitly provide it.
    return await db.transaction('videos', 'readwrite')
        .objectStore('videos')
        .add({ uri, metadata });
}

// UPDATE an existing video by ID
export async function updateVideo(id: IDBValidKey, uri: string | Blob, metadata: any): Promise<void> {
    const db = await initDB();
    await db.transaction('videos', 'readwrite')
        .objectStore('videos')
        .put({ id, uri, metadata });
}

// DELETE a video by ID
export async function deleteVideo(id: IDBValidKey): Promise<void> {
    const db = await initDB();
    await db.transaction('videos', 'readwrite')
        .objectStore('videos')
        .delete(id);
}

// GET a video by ID
export async function getVideo(id: IDBValidKey): Promise<VideoData | undefined> {
    if (id == undefined) return undefined;
    const db = await initDB();
    return await db.transaction('videos', 'readonly')
        .objectStore('videos')
        ?.get(id) as VideoData | undefined;
}


