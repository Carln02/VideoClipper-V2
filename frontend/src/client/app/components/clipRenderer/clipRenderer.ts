import {define, TurboProperties} from "turbodombuilder";
import {TextElement} from "../textElement/textElement";
import {Renderer} from "../../abstract/renderer/renderer";
import {ClipRendererView} from "./clipRenderer.view";
import {ClipRendererModel} from "./clipRenderer.model";
import {Clip} from "../clip/clip";

@define("vc-clip-renderer")
export class ClipRenderer extends Renderer<ClipRendererView, ClipRendererModel> {
    constructor(properties: TurboProperties = {}, videoProperties: TurboProperties<"video"> = {}) {
        super(properties);

        this.model = new ClipRendererModel(this);
        this.view = new ClipRendererView(this);
        this.view.canvas.setProperties({id: "card-frame-canvas"});
        this.view.videos.forEach((video: HTMLVideoElement) => video.setProperties(videoProperties));

        this.model.onTextAdded = (syncedText, id) => {
            const text = new TextElement(syncedText, this);
            this.view.addTextElement(text, id);
            return text;
        };

        this.model.initialize();
        this.view.resize();
    }

    public get currentClip(): Clip {
        return this.view.currentClip;
    }

    public async setFrame(clip: Clip = this.view.currentClip, offsetTime: number = 0, force: boolean = false,
                          forceCanvas: boolean = false) {
        await this.view.setFrame(clip, offsetTime, force, forceCanvas);
    }
}