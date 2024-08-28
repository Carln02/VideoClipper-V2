import {SyncedType} from "../../../../abstract/syncedComponent/syncedComponent.types";

export enum CaptureMode {
    photo = "PHOTO",
    video = "VIDEO",
    create = "CREATE",
    videoShooting = "VIDEO SHOOTING"
}

export type SyncedMedia = SyncedType<SyncedMediaWithoutId>;

export type SyncedMediaWithoutId = {
    type?: "image" | "video",
    timestamp?: number,
    duration?: number,
    media?: string
};
