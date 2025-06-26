import {RequestHandler} from "../requestHandler/requestHandler";
import {IDBPDatabase, openDB} from "idb";
import {Project} from "../../directors/project/project";
import {MediaData, SyncedMedia} from "./mediaHandler.types";
import { YMap } from "../../../yManagement/yManagement.types";

export class MediaHandler extends RequestHandler {
    private document: Project;
    private localDatabase: IDBPDatabase;

    public constructor(document: Project) {
        super();
        this.document = document;
    }

    private get url(): string {
        return this.serverUrl + "api/media/";
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

    public getMediaMetadata(id: string): SyncedMedia & YMap {
        return this.document.getMedia(id);
    }

    public setMediaMetadata(id: string, media: SyncedMedia) {
        this.document.setMedia(id, media);
    }

    public async getMedia(id: string): Promise<Blob | undefined> {
        if (id == undefined) return undefined;
        const type = id.split("-")[0] == "image" ? "image" : "video";

        const db = await this.initializeLocalDatabase();
        const storeName = type + "s";
        const cachedMedia = await db.transaction(storeName, "readonly").objectStore(storeName)?.get(id) as MediaData | undefined;
        if (cachedMedia) return cachedMedia.blob;

        return new Promise<Blob | undefined>((resolve) => {
            this.makeRequest(this.url + id, "GET", id, response => resolve(response),
                error => console.error("Download failed", error), false, "blob");
        });
    }

    public async updateMedia(data: SyncedMedia, blob: Blob): Promise<string> {
        const id = data?.id;
        if (!id) return undefined;
        this.setMediaMetadata(id, data);

        if (!blob) return id;
        console.log("SAVING BLOB", blob)

        const type = data.type ?? "video";
        const extension = blob.type === "video/mp4" ? ".mp4"
            : blob.type === "video/webm" ? ".webm"
                : blob.type === "image/png" ? ".png"
                    : blob.type === "image/jpeg" ? ".jpg"
                        : "";

        const formData = new FormData();
        formData.append("media", blob, id + extension);
        this.makeRequest(this.url + id, "POST", formData, response => console.log("Upload success", response),
            error => console.error("Upload failed", error), false);

        const db = await this.initializeLocalDatabase();
        const storeName = type + "s";
        await db.transaction(storeName, "readwrite").objectStore(storeName).put({id, blob});

        return id;
    }

    public async saveMedia(data: SyncedMedia, blob: Blob): Promise<string> {
        if (!data) return undefined;
        if (!data.id) {
            const type = data.type ?? "video";
            data.id = `${type}-${Math.floor(Math.random() * 1000)}-${Date.now()}`;
        }
        return this.updateMedia(data, blob);
    }

    public async convertMedia(data: MediaData): Promise<boolean> {
        const formData = new FormData();
        formData.append("id", String(data.id));
        formData.append("video", data.blob, `${data.id}.webm`);

        return new Promise<boolean | undefined>((resolve) => {
            this.makeRequest(this.url + "convert/", "POST", formData, () => resolve(true),
                    error => console.error("Failed to convert video", error), false);
        });
    }
}