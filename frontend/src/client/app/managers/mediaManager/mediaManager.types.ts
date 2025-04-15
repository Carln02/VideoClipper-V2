export type SyncedMedia = {
    id?: string,
    type?: "image" | "video",
    timestamp?: number,
    duration?: number,
    media?: string,
    blob?: Blob
};

export type MediaData = {
    id: number,
    blob: Blob
}