export type SyncedMedia = {
    id?: string,
    type?: "image" | "video",
    timestamp?: number,
    duration?: number,
    media?: string,
    converting?: boolean
};

export type MediaData = {
    id: string,
    blob: Blob
}