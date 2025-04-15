import {RequestManager} from "../requestManager/requestManager";
import {IDBPDatabase, openDB} from "idb";
import {SyncedMedia, MediaData } from "./mediaManager.types";
import {DocumentManager} from "../documentManager/documentManager";

export class MediaManager extends RequestManager {
    private documentManager: DocumentManager;
    private localDatabase: IDBPDatabase;

    public constructor(documentManager: DocumentManager) {
        super();
        this.documentManager = documentManager;
    }

    private get url(): string {
        return this.baseUrl + "media/";
    }

    private async initializeLocalDatabase() {
        if (!this.localDatabase) this.localDatabase = await openDB("myVideoDB", 1, {
            upgrade(db) {
                if (!db.objectStoreNames.contains("videos")) db.createObjectStore("videos", {keyPath: "id"});
                if (!db.objectStoreNames.contains("images")) db.createObjectStore("images", {keyPath: "id"});
            }
        });
        return this.localDatabase;
    }

    public async getMedia(id: string): Promise<SyncedMedia | undefined> {
        if (id == undefined) return undefined;
        const type = id.split("-")[0] == "image" ? "image" : "video";

        const metadata = this.documentManager.getMedia(id);

        const db = await this.initializeLocalDatabase();
        const storeName = type + "s";
        const cachedMedia = await db.transaction(storeName, "readonly").objectStore(storeName)?.get(id) as MediaData | undefined;
        if (cachedMedia) return {...metadata, blob: cachedMedia.blob};

        return new Promise<Blob | undefined>((resolve) => {
            this.makeRequest(this.url + id, "GET", id, response => resolve(response),
                error => console.error("Upload failed", error), false);
        }).then(blob => {return {...metadata, blob: blob};});
    }

    public async saveMedia(data: SyncedMedia): Promise<string> {
        const blob = data?.blob;
        if (!blob) return undefined;

        const type = data?.type ?? "video";
        const id = `${type}-${Math.floor(Math.random() * 1000)}-${Date.now()}`;

        this.documentManager.setMedia(id, {...data, blob: undefined});

        const formData = new FormData();
        formData.append("media", blob, id);
        this.makeRequest(this.url + id, "POST", formData, response => console.log("Upload success", response),
            error => console.error("Upload failed", error), false);

        const db = await this.initializeLocalDatabase();
        const storeName = type + "s";
        await db.transaction(storeName, "readwrite").objectStore(storeName).add({id, blob});

        return id;
    }

    public async updateMedia(data: SyncedMedia): Promise<string> {
        const id = data?.id;
        const blob = data?.blob;
        if (!id || !blob) return undefined;

        const type = data?.type ?? "video";
        this.documentManager.setMedia(id, {...data, blob: undefined});

        const formData = new FormData();
        formData.append("media", blob, id.toString());
        this.makeRequest(this.url + id, "POST", formData, response => console.log("Upload success", response),
            error => console.error("Upload failed", error), false);

        const db = await this.initializeLocalDatabase();
        const storeName = type + "s";
        await db.transaction(storeName, "readwrite").objectStore(storeName).put({id, blob});

        return id;
    }
}