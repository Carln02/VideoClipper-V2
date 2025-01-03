import {define, div, TurboProperties, video} from "turbodombuilder";
import {TextElement} from "../textElement/textElement";
import {ClipRendererVideoInfo, ClipRendererVisibility} from "./clipRenderer.types";
import {Clip} from "../clip/clip";
import {Renderer} from "../../abstract/renderer/renderer";
import {SyncedClip} from "../clip/clip.types";
import {SyncedText, TextType} from "../textElement/textElement.types";
import {SyncedCard} from "../card/card.types";
import {YProxyEventName} from "../../../../yProxy";

@define("vc-clip-renderer")
export class ClipRenderer extends Renderer {
    private _cardData: SyncedCard;
    private _clipData: SyncedClip;

    private readonly videos: ClipRendererVideoInfo[] = [];
    private _currentVideoIndex: number = 0;

    public readonly textParent: HTMLDivElement;
    private readonly textElements: TextElement[];

    private currentOffset: number = 0;

    private readonly frameUpdateFrequency: number = 100 as const;
    private lastFrameUpdate: number = 0;

    private _visibilityMode: ClipRendererVisibility;

    constructor(properties: TurboProperties = {}, videoProperties: TurboProperties<"video"> = {}) {
        super({id: "card-frame-canvas"}, properties);

        this.videos.push({
            video: video({...videoProperties, id: "1", parent: this}),
            clip: null
        }, {
            video: video({...videoProperties, id: "2", parent: this}),
            clip: null,
        });

        this.addChild(this.canvasElement);
        this.textParent = div({parent: this});
        this.textElements = [];

        this.resize();
    }

    private setupCardCallbacks() {
        this.cardData.title.bind(YProxyEventName.changed, () => {
            const entries = this.textElements.filter(value => value.data.type == TextType.title);
            if (entries.length == 0) return;
            entries.forEach(entry => entry.textValue = this.cardData.title.value);
            this.reloadVisibility(true);
        }, this);
    }

    private setupClipCallbacks() {
        this.clipData.content.bind(YProxyEventName.entryChanged, (newValue: SyncedText, oldValue, isLocal, path) => {
            if (!newValue && !oldValue) return;

            const key = path[path.length - 1];
            const index: number = typeof key == "number" ? key : Number.parseInt(key);

            if (!newValue) {
                this.textElements[index]?.destroy();
                this.textElements.splice(index, 1);
            } else if (!oldValue) {
                const text = new TextElement(newValue, this);
                this.textParent.addChild(text, index);
                this.textElements.splice(index, 0, text);
            } else {
                const text = this.textElements[index];
                if (text) text.data = newValue;
            }
        }, this);
    }

    public get cardData(): SyncedCard {
        return this._cardData;
    }

    public set cardData(value: SyncedCard) {
        if (this.cardData == value) return;
        this.cardData?.unbindObject(this);
        this._cardData = value;
        this.setupCardCallbacks();
    }

    public get clipData(): SyncedClip {
        return this._clipData;
    }

    public set clipData(value: SyncedClip) {
        if (this.clipData == value) return;
        this.clipData?.unbindObject(this);
        this._clipData = value;
        this.setupClipCallbacks();
    }

    public get video(): HTMLVideoElement {
        return this.videos[this.currentVideoIndex].video;
    }

    public get currentVideoIndex(): number {
        return this._currentVideoIndex;
    }

    private set currentVideoIndex(value: number) {
        while (value < 0) value += this.videos.length;
        while (value >= this.videos.length) value -= this.videos.length;
        this._currentVideoIndex = value;
    }

    private get nextVideoInfo(): ClipRendererVideoInfo {
        let index = this.currentVideoIndex + 1;
        if (index >= this.videos.length) index -= this.videos.length;
        return this.videos[index];
    }

    private get previousVideoInfo(): ClipRendererVideoInfo {
        let index = this.currentVideoIndex - 1;
        if (index < 0) index += this.videos.length;
        return this.videos[index];
    }

    public get currentClip(): Clip {
        return this.videos[this.currentVideoIndex].clip;
    }

    private set currentClip(value: Clip) {
        this.videos[this.currentVideoIndex].clip = value;
    }

    private async setCurrentClipBackground(clip: Clip, forceCanvas: boolean = false) {
        if (clip.data.backgroundFill) {
            this.setCanvas(clip.data.backgroundFill.value);
        } else if (clip.data.mediaId) {
            if (this.currentClip.metadata?.type == "image") this.setCanvas(this.currentClip.uri);
            else {
                this.setCanvas(null);
                this.video.src = this.currentClip.uri;
                this.video.currentTime = this.currentOffset;
                if (forceCanvas) {
                    await this.waitForVideoLoad();
                    this.setCanvas(this.video);
                }
            }
        }

        this.reloadVisibility();
    }

    public async setFrame(clip: Clip = this.currentClip, offsetTime: number = 0, force: boolean = false,
                          forceCanvas: boolean = false) {
        if (!clip) {
            this.reloadVisibility();
            return;
        }

        if (!force && Date.now() - this.lastFrameUpdate < this.frameUpdateFrequency) return;
        this.lastFrameUpdate = Date.now();

        this.pause();
        this.clipData = clip.data;

        if (clip.data.mediaId && clip.data.mediaId == this.currentClip?.data.mediaId) {
            this.setCanvas(null);
            if (this.currentClip.metadata?.type == "video") this.video.currentTime = offsetTime;
            if (forceCanvas) {
                await this.waitForVideoLoad();
                this.setCanvas(this.video);
            }
            return;
        }

        this.currentOffset = offsetTime;
        this.currentClip = clip;

        await this.setCurrentClipBackground(clip, forceCanvas);
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
            this.addChildBefore(this.previousVideoInfo.video, this.video);
            this.previousVideoInfo.video.setStyle("display", "");
        });
    }

    public play() {
        if (this.currentClip?.metadata?.type == "video") this.video.play();
    }

    public pause() {
        if (!this.video.paused) this.video.pause();
    }

    public get visibilityMode() {
        return this._visibilityMode;
    }

    public set visibilityMode(value: ClipRendererVisibility) {
        if (value == this._visibilityMode) return;
        this._visibilityMode = value;
        this.reloadVisibility(true);
    }

    public reloadVisibility(setFrame: boolean = false) {
        switch (this.visibilityMode) {
            case ClipRendererVisibility.shown:
                this.setStyle("opacity", "1");
                this.textParent.setStyle("display", "");
                if (setFrame) this.setFrame(this.currentClip, this.currentOffset, true);
                break;
            case ClipRendererVisibility.ghosting:
                this.setStyle("opacity", this.currentClip.data.backgroundFill ? "0" : "0.2");
                if (typeof this.currentFill == "string" && this.currentFill.length < 30) this.setCanvas(null);
                this.textParent.setStyle("display", "none");
                if (setFrame) this.setFrame(this.currentClip, this.currentOffset, true);
                break
            case ClipRendererVisibility.hidden:
                this.setStyle("opacity", "0");
                this.textParent.setStyle("display", "none");
                break;
        }
    }
}