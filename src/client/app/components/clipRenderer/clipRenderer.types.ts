import {Clip} from "../clip/clip";

export enum ClipRendererVisibility {
    shown,
    ghosting,
    hidden
}

export type ClipRendererVideoInfo = {
    video: HTMLVideoElement,
    clip?: Clip
};