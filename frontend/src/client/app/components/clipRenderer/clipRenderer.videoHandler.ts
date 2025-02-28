import {ClipRendererVideoInfo} from "./clipRenderer.types";
import {Clip} from "../clip/clip";

export class ClipRendererVideoHandler {
    public readonly videos: ClipRendererVideoInfo[] = [];
    private _currentVideoIndex: number = 0;

    public get video(): HTMLVideoElement {
        return this.videos[this.currentVideoIndex].video;
    }

    public get currentVideoIndex(): number {
        return this._currentVideoIndex;
    }

    public set currentVideoIndex(value: number) {
        while (value < 0) value += this.videos.length;
        while (value >= this.videos.length) value -= this.videos.length;
        this._currentVideoIndex = value;
    }

    public get nextVideoInfo(): ClipRendererVideoInfo {
        let index = this.currentVideoIndex + 1;
        if (index >= this.videos.length) index -= this.videos.length;
        return this.videos[index];
    }

    public get previousVideoInfo(): ClipRendererVideoInfo {
        let index = this.currentVideoIndex - 1;
        if (index < 0) index += this.videos.length;
        return this.videos[index];
    }

    public get currentClip(): Clip {
        return this.videos[this.currentVideoIndex].clip;
    }

    public set currentClip(value: Clip) {
        this.videos[this.currentVideoIndex].clip = value;
    }

    public loadNext(clip: Clip, offset: number = 0) {
        if (!clip || !clip.uri || !clip.metadata) return;

        this.nextVideoInfo.video.src = clip.uri;
        this.nextVideoInfo.clip = clip;
        this.nextVideoInfo.video.currentTime = offset;
    }

    public playNext() {
        if (this.nextVideoInfo.clip?.metadata?.type != "video") return;

        this.video.setStyle("display", "none");
        this.currentVideoIndex++;
        this.play();

        requestAnimationFrame(() => {
            this.video.parentElement.addChildBefore(this.previousVideoInfo.video, this.video);
            this.previousVideoInfo.video.setStyle("display", "");
        });
    }

    public play() {
        if (this.currentClip?.metadata?.type == "video") this.video.play();
    }

    public pause() {
        if (!this.video.paused) this.video.pause();
    }
}