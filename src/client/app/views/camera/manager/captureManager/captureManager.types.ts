import {YNumber, YProxied, YString} from "../../../../../../yProxy/yProxy/types/proxied.types";

export enum CaptureMode {
    photo = "PHOTO",
    video = "VIDEO",
    create = "CREATE",
    videoShooting = "VIDEO SHOOTING"
}

export type SyncedMedia = YProxied<{
    type?: YProxied<"image" | "video">,
    timestamp?: YNumber,
    duration?: YNumber,
    media?: YString
}>;

export type SyncedMediaWithoutId = {
    type?: "image" | "video",
    timestamp?: number,
    duration?: number,
    media?: string
};
