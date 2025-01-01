import {RendererView} from "../../abstract/renderer/renderer.view";
import {ClipRenderer} from "./clipRenderer";
import {ClipRendererModel} from "./clipRenderer.model";
import {TextType} from "../textElement/textElement.types";
import {ClipRendererVisibility} from "./clipRenderer.types";
import {ClipRendererVideoManager} from "./clipRenderer.videoManager";
import {auto, div, video} from "turbodombuilder";
import {Clip} from "../clip/clip";
import {TextElement} from "../textElement/textElement";

export class ClipRendererView extends RendererView<ClipRenderer, ClipRendererModel> {
    private readonly videoManager: ClipRendererVideoManager;

    protected textParent: HTMLDivElement;

    private currentOffset: number = 0;

    private readonly frameUpdateFrequency: number = 100 as const;
    private lastFrameUpdate: number = 0;

    public constructor(element: ClipRenderer) {
        super(element, false);
        this.videoManager = new ClipRendererVideoManager();
        this.initialize();
    }

    public get video(): HTMLVideoElement {
        return this.videoManager.video;
    }

    public get videos(): HTMLVideoElement[] {
        return this.videoManager.videos.map(video => video.video);
    }

    public get currentVideoIndex(): number {
        return this.videoManager.currentVideoIndex;
    }

    public get currentClip(): Clip {
        return this.videoManager.currentClip;
    }

    @auto({cancelIfUnchanged: true})
    public set visibilityMode(value: ClipRendererVisibility) {
        this.reloadVisibility(true);
    }

    protected setupUIElements() {
        super.setupUIElements();
        this.videoManager.videos.push({video: video({id: "1"}), clip: null}, {video: video({id: "2"}), clip: null});
        this.textParent = div();
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild(this.videos);
        this.element.addChild([this.canvas, this.textParent]);
    }

    public titleChanged() {
        const entries = this.model.textElements
            .filter(textElement => textElement.type == TextType.title);
        if (entries.length == 0) return;
        entries.forEach(entry => entry.textValue = this.model.cardTitle);
        this.reloadVisibility(true);
    }

    public addTextElement(element: TextElement, id?: number) {
        this.textParent.addChild(element, id);
    }

    private async setCurrentClipBackground(clip: Clip, forceCanvas: boolean = false) {
        if (clip.backgroundFill) {
            this.setCanvas(clip.backgroundFill);
        } else if (clip.mediaId) {
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

        this.videoManager.pause();
        this.model.clipData = clip.model.data;

        if (clip.mediaId && clip.mediaId == this.currentClip?.mediaId) {
            this.setCanvas(null);
            if (this.currentClip.metadata?.type == "video") this.video.currentTime = offsetTime;
            if (forceCanvas) {
                await this.waitForVideoLoad();
                this.setCanvas(this.video);
            }
            return;
        }

        this.currentOffset = offsetTime;
        this.videoManager.currentClip = clip;

        await this.setCurrentClipBackground(clip, forceCanvas);
    }

    public reloadVisibility(setFrame: boolean = false) {
        switch (this.visibilityMode) {
            case ClipRendererVisibility.shown:
                this.element.setStyle("opacity", "1");
                this.textParent.setStyle("display", "");
                if (setFrame) this.setFrame(this.currentClip, this.currentOffset, true);
                break;
            case ClipRendererVisibility.ghosting:
                this.element.setStyle("opacity", this.currentClip.backgroundFill ? "0" : "0.2");
                if (typeof this.model.currentFill == "string" && this.model.currentFill.length < 30) this.setCanvas(null);
                this.textParent.setStyle("display", "none");
                if (setFrame) this.setFrame(this.currentClip, this.currentOffset, true);
                break
            case ClipRendererVisibility.hidden:
                this.element.setStyle("opacity", "0");
                this.textParent.setStyle("display", "none");
                break;
        }
    }
}