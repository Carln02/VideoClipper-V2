import {Renderer} from "./renderer";
import {canvas, div, MvcViewProperties, Shown, StatefulReifect, TurboView, video} from "turbodombuilder";
import {RendererModel} from "./renderer.model";

export class RendererView<
    ComponentType extends Renderer = Renderer,
    ModelType extends RendererModel = RendererModel
> extends TurboView<ComponentType, ModelType> {
    private _canvas: HTMLCanvasElement;

    public readonly videos: HTMLVideoElement[] = [];
    protected snapshotEffectDiv: HTMLDivElement;

    public canvasContext: CanvasRenderingContext2D;

    public snapshotEffectTransition: StatefulReifect<Shown> = new StatefulReifect<Shown>({
        states: [Shown.visible, Shown.hidden],
        properties: "opacity",
        transitionProperties: "opacity",
        transitionDuration: 0.05,
        transitionTimingFunction: "ease-out",
        styles: {visible: 1, hidden: 0},
    });

    public rendererShowTransition: StatefulReifect<Shown> = new StatefulReifect<Shown>({
        properties: "opacity",
        styles: {visible: 1, hidden: 0},
        states: [Shown.visible, Shown.hidden]
    });

    public constructor(properties: MvcViewProperties<ComponentType, ModelType>) {
        super(properties);
        this.element.addClass("vc-renderer");
        this.element.showTransition = this.rendererShowTransition;
    }

    public initialize() {
        super.initialize();
        this.snapshotEffectTransition.attach(this.snapshotEffectDiv);
        this.snapshotEffectTransition.apply(Shown.hidden);
    }

    protected setupUIElements() {
        this.canvas = canvas();
        this.canvasContext = this.canvas.getContext("2d");
        for (let i = 0; i < this.model.videoElementsCount; i++) this.videos.push(video());
        this.snapshotEffectDiv = div({classes: "snapshot-effect-div"});
    }

    protected setupUILayout() {
        super.setupUILayout();
        this.element.addChild([...this.videos, this.snapshotEffectDiv, this.canvas]);
    }

    public get video(): HTMLVideoElement {
        return this.videos[this.model.currentIndex];
    }

    public get width() {
        return this.canvas.width;
    }

    public get height() {
        return this.canvas.height;
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    protected set canvas(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
    }

    public animateSnapshotEffect() {
        this.snapshotEffectDiv.setStyle("display", "block");
        this.snapshotEffectTransition.apply(Shown.visible);
        setTimeout(() => {
            this.snapshotEffectTransition.apply(Shown.hidden);
            setTimeout(() => this.snapshotEffectDiv.setStyle("display", "none"),
                this.snapshotEffectTransition.transitionDuration[Shown.hidden] * 1000);
        }, this.snapshotEffectTransition.transitionDuration[Shown.visible] * 1000);
    }
}