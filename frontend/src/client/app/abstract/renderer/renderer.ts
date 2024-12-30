import {canvas, Shown, StatefulReifect, TurboProperties} from "turbodombuilder";
import "./renderer.css";
import {YComponent} from "../../../../yManagement/yMvc/yComponent";

export abstract class Renderer extends YComponent {
    public readonly canvasElement: HTMLCanvasElement;
    public readonly canvasContext: CanvasRenderingContext2D;

    protected currentFill: string | CanvasImageSource = null;

    private static rendererShowTransition: StatefulReifect<Shown> = new StatefulReifect<Shown>({
        properties: "opacity",
        styles: {visible: 1, hidden: 0},
        states: [Shown.visible, Shown.hidden]
    });

    protected constructor(canvasProperties: TurboProperties<"canvas"> = {}, properties: TurboProperties = {}) {
        super(properties);
        this.addClass("vc-renderer");
        this.showTransition = Renderer.rendererShowTransition;

        this.canvasElement = canvas(canvasProperties);
        this.canvasContext = this.canvasElement.getContext("2d");
    }

    public resize(aspectRatio: number = 1.33, width: number = this.offsetWidth, height: number = this.offsetHeight) {
        if (width / height <= aspectRatio) {
            this.setStyle("width", width + "px");
            this.setStyle("height", width / aspectRatio + "px");
            this.canvasElement.width = width;
            this.canvasElement.height = width / aspectRatio;
        } else {
            this.setStyle("width", height * aspectRatio + "px");
            this.setStyle("height", height + "px");
            this.canvasElement.width = height * aspectRatio;
            this.canvasElement.height = height;
        }
    }

    public get width() {
        return this.canvasElement.width;
    }

    public get height() {
        return this.canvasElement.height;
    }

    public abstract get video(): HTMLVideoElement;

    public setCanvas(fill: string | CanvasImageSource = this.currentFill) {
        this.currentFill = fill;

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
        return this.canvasElement.toDataURL("image/png");
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