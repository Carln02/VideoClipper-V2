import {Timeline} from "./timeline";

export class TimelinePlayHandler {
    private readonly element: Timeline;

    private playTimer: NodeJS.Timeout | null = null;
    private nextTimer: NodeJS.Timeout | null = null;

    constructor(element: Timeline) {
        this.element = element;
    }

    public isPlaying(): boolean {
        return this.playTimer != null;
    }

    private async playNext(index: number, offset = 0) {
        if (index >= this.element.dataSize) return this.play(false);

        await this.element.renderer.setFrame(this.element.getClipAtIndex(index), offset);
        this.element.renderer.playNext();

        this.element.renderer.loadNext(this.element.getClipAtIndex(index + 1));

        this.nextTimer = setTimeout(() => this.playNext(index + 1),
            1000 * ((this.element.getClipAtIndex(index)?.duration || 0) - offset)
        );
    }

    public async play(play: boolean = !this.isPlaying()) {
        if (this.nextTimer) clearTimeout(this.nextTimer);
        this.nextTimer = null;

        if (this.playTimer) clearInterval(this.playTimer);
        this.playTimer = null;

        if (!play) {
            this.element.renderer.pause();
            return;
        }

        if (this.element.currentTime >= this.element.totalDuration - 0.1) this.element.currentTime = 0;

        this.playTimer = setInterval(() => {
            this.element.currentTime += 0.01;
            if (this.element.currentTime >= this.element.totalDuration) clearInterval(this.playTimer);
        }, 10);

        this.element.renderer.loadNext(this.element.currentClip.clip, this.element.currentClip.offset);

        return this.playNext(this.element.currentClip.index, this.element.currentClip.offset);
    }
}