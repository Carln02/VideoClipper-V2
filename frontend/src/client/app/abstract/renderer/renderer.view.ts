import {YView} from "../../../../yManagement/yMvc/yView";
import {Renderer} from "./renderer";
import {canvas} from "turbodombuilder";
import {RendererModel} from "./renderer.model";

export class RendererView<
    ComponentType extends Renderer = Renderer,
    ModelType extends RendererModel = RendererModel
> extends YView<ComponentType, ModelType> {
    private _video: HTMLVideoElement;
    private _canvas: HTMLCanvasElement;

    protected canvasContext: CanvasRenderingContext2D;

    public constructor(element: ComponentType, initialize: boolean = true) {
        super(element, initialize);
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

    public get video(): HTMLVideoElement {
        return this._video;
    }

    protected set video(value: HTMLVideoElement) {
        this._video = value;
    }

    public get canvas(): HTMLCanvasElement {
        return this._canvas;
    }

    protected set canvas(canvas: HTMLCanvasElement) {
        this._canvas = canvas;
    }

    public resize(aspectRatio: number = 1.33, width: number = this.element.offsetWidth, height: number = this.element.offsetHeight) {
        if (width / height <= aspectRatio) {
            this.element.setStyle("width", width + "px");
            this.element.setStyle("height", width / aspectRatio + "px");
            this.canvas.width = width;
            this.canvas.height = width / aspectRatio;
        } else {
            this.element.setStyle("width", height * aspectRatio + "px");
            this.element.setStyle("height", height + "px");
            this.canvas.width = height * aspectRatio;
            this.canvas.height = height;
        }
    }

    public setCanvas(fill: string | CanvasImageSource = this.model.currentFill) {
        this.model.currentFill = fill;

        if (!fill) {
            this.canvasContext.clearRect(0, 0, this.width, this.height);
            return;
        }

        if (typeof fill == "string") {
            if (fill.length < 30) {
                // Assume it's a color string
                this.canvasContext.fillStyle = fill;
                this.canvasContext.fillRect(0, 0, this.width, this.height);
                return;
            } else {
                // Assume it's a data URL string representing an image
                const img = new Image();
                img.onload = () => {
                    this.canvasContext.drawImage(img, 0, 0, this.width, this.height);
                };
                img.onerror = (err) => {
                    console.error("Failed to load image:", err);
                    // Handle the error as needed
                };
                img.src = fill;
                // Return here to prevent execution of the code below
                return;
            }
        } else {
            // Assume 'fill' is a CanvasImageSource
            this.canvasContext.drawImage(fill, 0, 0, this.width, this.height);
        }
    }


    public async drawFromImageSource(src: CanvasImageSource) {
        if (src instanceof HTMLVideoElement) await this.waitForVideoLoad(src);
        this.canvasContext.drawImage(src, 0, 0, this.width, this.height);
        return this.canvas.toDataURL("image/png");
    }

    protected waitForVideoLoad(video: HTMLVideoElement = this.video, delay: number = 300): Promise<void> {
        return new Promise((resolve, reject) => {
            if (video.readyState >= 2) {
                setTimeout(resolve, delay);
            } else {
                const onCanPlay = () => {
                    video.removeEventListener("canplaythrough", onCanPlay);
                    setTimeout(resolve, delay);
                };
                const onError = (err: unknown) => {
                    video.removeEventListener("error", onError);
                    reject(err);
                };
                video.addEventListener("canplaythrough", onCanPlay);
                video.addEventListener("error", onError);
            }
        });
    }
}