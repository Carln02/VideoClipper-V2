export enum CaptureMode {
    photo = "PHOTO",
    video = "VIDEO",
    create = "CREATE",
    videoShooting = "VIDEO SHOOTING"
}

export type SyncedMedia = {
    type?: "image" | "video",
    timestamp?: number,
    duration?: number,
    media?: string
};

export type SyncedMediaWithoutId = {
    type?: "image" | "video",
    timestamp?: number,
    duration?: number,
    media?: string
};
