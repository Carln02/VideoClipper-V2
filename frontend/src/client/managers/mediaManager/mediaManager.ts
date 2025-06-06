import {RequestManager} from "../requestManager/requestManager";
import {IDBPDatabase, openDB} from "idb";
import {SyncedMedia, MediaData } from "./mediaManager.types";
import {Project} from "../../screens/project/project";

export class MediaManager extends RequestManager {
    private document: Project;
    private localDatabase: IDBPDatabase;

    public constructor(document: Project) {
        super();
        this.document = document;
    }

    private get url(): string {
        return this.serverUrl + "media/";
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

        const metadata = this.document.getMedia(id);

        const db = await this.initializeLocalDatabase();
        const storeName = type + "s";
        const cachedMedia = await db.transaction(storeName, "readonly").objectStore(storeName)?.get(id) as MediaData | undefined;
        if (cachedMedia) return {...metadata, blob: cachedMedia.blob};

        return new Promise<Blob | undefined>((resolve) => {
            this.makeRequest(this.url + id, "GET", id, response => resolve(response),
                error => console.error("Upload failed", error), false, "blob");
        }).then(blob => {
            console.log(blob);
            return {...metadata, blob: blob};});
    }

    public async updateMedia(data: SyncedMedia): Promise<string> {
        const id = data?.id;
        const blob = data?.blob;
        if (!id || !blob) return undefined;

        const type = data.type ?? "video";
        this.document.setMedia(id, {...data, blob: undefined});

        const formData = new FormData();

        const extension = blob.type === "video/mp4" ? ".mp4"
            : blob.type === "video/webm" ? ".webm"
                : blob.type === "image/png" ? ".png"
                    : blob.type === "image/jpeg" ? ".jpg"
                        : "";

        formData.append("media", blob, id + extension);
        this.makeRequest(this.url + id, "POST", formData, response => console.log("Upload success", response),
            error => console.error("Upload failed", error), false);

        const db = await this.initializeLocalDatabase();
        const storeName = type + "s";
        await db.transaction(storeName, "readwrite").objectStore(storeName).put({id, blob});

        return id;
    }

    public async saveMedia(data: SyncedMedia): Promise<string> {
        if (!data?.blob) return undefined;
        const type = data.type ?? "video";
        data.id = `${type}-${Math.floor(Math.random() * 1000)}-${Date.now()}`;
        return this.updateMedia(data);
    }
}