import {Renderer} from "./renderer";
import {canvas, MvcViewProperties, Shown, StatefulReifect, TurboView} from "turbodombuilder";
import {RendererModel} from "./renderer.model";

export class RendererView<
    ComponentType extends Renderer = Renderer,
    ModelType extends RendererModel = RendererModel
> extends TurboView<ComponentType, ModelType> {
    private _canvas: HTMLCanvasElement;

    public readonly videos: HTMLVideoElement[] = [];

    public canvasContext: CanvasRenderingContext2D;

    private static rendererShowTransition: StatefulReifect<Shown> = new StatefulReifect<Shown>({
        properties: "opacity",
        styles: {visible: 1, hidden: 0},
        states: [Shown.visible, Shown.hidden]
    });

    public constructor(properties: MvcViewProperties<ComponentType, ModelType>) {
        super(properties);
        this.element.addClass("vc-renderer");
        this.element.showTransition = RendererView.rendererShowTransition;
    }

    public get video(): HTMLVideoElement {
        return this.videos[this.model.currentIndex];
    }

    protected setupUIElements() {
        this.canvas = canvas();
        this.canvasContext = this.canvas.getContext("2d");
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
}