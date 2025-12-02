import {Renderer} from "./renderer";
import {canvas, div, expose, Shown, StatefulReifect, turbo, TurboView, video} from "turbodombuilder";
import {RendererModel} from "./renderer.model";

export class RendererView<
    ComponentType extends Renderer = Renderer,
    ModelType extends RendererModel = RendererModel
> extends TurboView<ComponentType, ModelType> {
    private _canvas: HTMLCanvasElement;

    @expose("canvas", false) public width: number;
    @expose("canvas", false) public height: number;

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

    public get video(): HTMLVideoElement {
        return this.videos[this.model.currentIndex];
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    public initialize() {
        super.initialize();
        turbo(this).showTransition = this.rendererShowTransition;
        this.snapshotEffectTransition.attach(this.snapshotEffectDiv);
        this.snapshotEffectTransition.apply(Shown.hidden);
    }

    protected setupUIElements() {
        this._canvas = canvas(this.element.canvasProperties);
        this.canvasContext = this.canvas.getContext("2d");
        for (let i = 0; i < this.model.videoElementsCount; i++) this.videos.push(video(this.element.videoProperties));
        this.snapshotEffectDiv = div({classes: "snapshot-effect-div"});
    }

    protected setupUILayout() {
        super.setupUILayout();
        turbo(this).addChild([...this.videos, this.snapshotEffectDiv, this.canvas]);
    }

    public animateSnapshotEffect() {
        this.snapshotEffectTransition.apply(Shown.visible);
        setTimeout(() => this.snapshotEffectTransition.apply(Shown.hidden), 50);
    }

    public resize(aspectRatio: number = 1.33, width: number = this.element.offsetWidth,
                  height: number = this.element.offsetHeight) {
        if (width / height <= aspectRatio) height = width / aspectRatio;
        else width = height * aspectRatio;

        turbo(this).setStyles(`width: ${width}px; height: ${height}px`);
        turbo(this.snapshotEffectDiv).setStyles(`width: ${width}px; height: ${height}px`);
        this.videos.forEach(video => turbo(video).setStyles(`width: ${width}px; height: ${height}px`));

        this.canvas.width = width;
        this.canvas.height = height;
    }
}